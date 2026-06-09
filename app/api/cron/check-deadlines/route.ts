import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Secure the cron endpoint with a secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    const db = getAdminDb();

    // Query all cards that have a deadline in the past, are not completed, and haven't had an email sent
    const snapshot = await db
      .collection("cards")
      .where("deadline", "<=", now)
      .where("isCompleted", "==", false)
      .where("deadlineEmailSent", "==", false)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "No overdue tasks found.", count: 0 });
    }

    const emailPromises: Promise<any>[] = [];
    const updatePromises: Promise<any>[] = [];

    for (const doc of snapshot.docs) {
      const card = doc.data();

      if (!card.assignedTo) continue; // skip unassigned cards

      const deadline = card.deadline?.toDate
        ? card.deadline.toDate()
        : new Date(card.deadline);

      const formattedDeadline = deadline.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      emailPromises.push(
        sendEmail({
          to: card.assignedTo,
          subject: `⚠️ Missed Deadline: "${card.title}"`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Missed Deadline Reminder</h2>
              <p>Hello,</p>
              <p>This is a reminder that the following task assigned to you has passed its deadline:</p>
              <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 16px 0; border-radius: 4px;">
                <strong style="font-size: 18px;">${card.title}</strong>
                <p style="margin: 8px 0 0; color: #7f1d1d;">Deadline: ${formattedDeadline}</p>
              </div>
              <p>Please complete this task as soon as possible.</p>
              <p style="color: #6b7280; font-size: 14px;">— Plovo Team</p>
            </div>
          `,
        })
      );

      // Mark email as sent so we don't send it again
      updatePromises.push(
        doc.ref.update({ deadlineEmailSent: true })
      );
    }

    await Promise.allSettled(emailPromises);
    await Promise.all(updatePromises);

    return NextResponse.json({
      message: `Processed ${snapshot.size} overdue task(s).`,
      count: snapshot.size,
    });
  } catch (error) {
    console.error("Cron check-deadlines error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
