import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/firebase/auth-helpers";
import { requireAdminRole, getWorkspaceMembers } from "@/lib/firebase/workspaces";
import { getAdminDb } from "@/lib/firebase/admin";
import { Info } from "../_components/info";
import { Separator } from "@/components/ui/separator";

interface MemberStats {
  userId: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: string;
  totalAssigned: number;
  completed: number;
  missed: number;
  completedOnTime: number;
  avgDaysEarly: number;
  score: number;
}

async function getMemberStats(orgId: string): Promise<MemberStats[]> {
  const db = getAdminDb();
  const allMembers = await getWorkspaceMembers(orgId);
  const members = allMembers.filter((m) => m.role === "member");

  // Get all boards in this workspace
  const boardsSnap = await db
    .collection("boards")
    .where("orgId", "==", orgId)
    .get();

  const boardIds = boardsSnap.docs.map((d) => d.id);
  if (boardIds.length === 0) return [];

  // Get all lists for all boards
  const allListIds: string[] = [];
  for (const boardId of boardIds) {
    const listsSnap = await db
      .collection("lists")
      .where("boardId", "==", boardId)
      .get();
    listsSnap.docs.forEach((d) => allListIds.push(d.id));
  }

  if (allListIds.length === 0) return [];

  // Firestore `in` supports up to 30 items; chunk if needed
  const chunks: string[][] = [];
  for (let i = 0; i < allListIds.length; i += 30) {
    chunks.push(allListIds.slice(i, i + 30));
  }

  let allCards: any[] = [];
  for (const chunk of chunks) {
    const cardsSnap = await db
      .collection("cards")
      .where("listId", "in", chunk)
      .get();
    cardsSnap.docs.forEach((d) => allCards.push({ id: d.id, ...d.data() }));
  }

  const now = new Date();

  const stats: MemberStats[] = members.map((member) => {
    const memberCards = allCards.filter((c) => {
      const assignees = c.assignees || [];
      const allAssignees = [...assignees, c.assignedTo].filter(Boolean) as string[];
      return allAssignees.includes(member.email);
    });

    const completed = memberCards.filter((c) => {
      const completedBy = c.completedBy || [];
      return completedBy.map((e: string) => e.toLowerCase()).includes(member.email.toLowerCase());
    }).length;
    const missed = memberCards.filter(
      (c) => {
        const completedBy = c.completedBy || [];
        const isUserCompleted = completedBy.map((e: string) => e.toLowerCase()).includes(member.email.toLowerCase());
        return !isUserCompleted && c.deadline && (c.deadline.toDate
          ? c.deadline.toDate() < now
          : new Date(c.deadline) < now);
      }
    ).length;

    // Cards completed before deadline
    let completedOnTime = 0;
    let totalDaysEarly = 0;

    for (const c of memberCards) {
      const completedBy = c.completedBy || [];
      const isUserCompleted = completedBy.map((e: string) => e.toLowerCase()).includes(member.email.toLowerCase());

      if (!isUserCompleted || !c.deadline || !c.completedAt) continue;
      const deadline = c.deadline?.toDate ? c.deadline.toDate() : new Date(c.deadline);
      const completedAt = c.completedAt?.toDate ? c.completedAt.toDate() : new Date(c.completedAt);
      const daysEarly = (deadline.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysEarly >= 0) {
        completedOnTime++;
        totalDaysEarly += daysEarly;
      }
    }

    const avgDaysEarly =
      completedOnTime > 0 ? totalDaysEarly / completedOnTime : 0;

    // Score: +10 per completed, +5 per day early bonus (capped at 20), -15 per miss
    const score =
      completed * 10 +
      Math.min(completedOnTime * avgDaysEarly * 5, completed * 20) -
      missed * 15;

    return {
      userId: member.userId,
      displayName: member.displayName,
      email: member.email,
      photoURL: member.photoURL,
      role: member.role,
      totalAssigned: memberCards.length,
      completed,
      missed,
      completedOnTime,
      avgDaysEarly: Math.round(avgDaysEarly * 10) / 10,
      score: Math.round(score),
    };
  });

  // Sort by score descending
  return stats.sort((a, b) => b.score - a.score);
}

function getRankBadge(index: number) {
  if (index === 0) return { emoji: "1", label: "Top Performer", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  if (index === 1) return { emoji: "2", label: "Runner Up", color: "bg-gray-100 text-gray-700 border-gray-300" };
  if (index === 2) return { emoji: "3", label: "3rd Place", color: "bg-orange-100 text-orange-700 border-orange-300" };
  return { emoji: `#${index + 1}`, label: "Member", color: "bg-blue-50 text-blue-700 border-blue-200" };
}

function ScoreBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const color =
    value < 0 ? "bg-red-400" : pct > 60 ? "bg-green-500" : "bg-amber-400";
  return (
    <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full ${color} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const AdminDashboardPage = async ({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) => {
  const { organizationId } = await params;
  const ctx = await getAuthContext();

  let isAdmin = false;
  try {
    if (ctx.userId) isAdmin = await requireAdminRole(organizationId, ctx.userId);
  } catch {
    isAdmin = false;
  }
  if (!isAdmin) redirect(`/organization/${organizationId}`);

  const stats = await getMemberStats(organizationId);
  const maxScore = stats.length > 0 ? Math.max(...stats.map((s) => Math.abs(s.score)), 1) : 1;

  return (
    <div className="w-full">
      <div className="p-6">
        <Info />
        <Separator className="my-4" />

        <h2 className="text-2xl font-bold mb-1">Member Performance Dashboard</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Members are ranked by their task completion speed and reliability.
          Score = +10 per completed task, +5 per day early (capped), −15 per missed deadline.
        </p>

        {stats.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No members or assigned tasks found.
          </p>
        ) : (
          <div className="space-y-4">
            {stats.map((member, index) => {
              const badge = getRankBadge(index);
              return (
                <div
                  key={member.userId}
                  className={`border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm ${
                    index === 0 ? "border-yellow-300 bg-yellow-50" : "bg-white"
                  }`}
                >
                  {/* Rank badge */}
                  <div className="flex-shrink-0 text-3xl w-12 text-center">
                    {badge.emoji}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {member.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photoURL}
                        alt={member.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        {member.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-base truncate">{member.displayName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">({member.role})</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>

                    {/* Score bar */}
                    <ScoreBar value={member.score} max={maxScore} />

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span><strong>{member.totalAssigned}</strong> assigned</span>
                      <span className="text-green-600"><strong>{member.completed}</strong> completed</span>
                      <span className="text-red-500"><strong>{member.missed}</strong> missed</span>
                      <span className="text-blue-600"><strong>{member.completedOnTime}</strong> on-time</span>
                      {member.avgDaysEarly > 0 && (
                        <span className="text-emerald-600">
                          avg <strong>{member.avgDaysEarly}d</strong> early
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-2xl font-bold ${member.score >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {member.score > 0 ? "+" : ""}{member.score}
                    </p>
                    <p className="text-xs text-muted-foreground">score</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
