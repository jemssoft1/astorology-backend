import express, { Request, Response } from "express";

import { SlackService } from "../../core/SlackService";

const router = express.Router();

// ============================================================================
// CHAT API ROUTES
// ============================================================================

router.post("/Message", async (req: Request, res: Response) => {
  try {
    const { fromEmail, msgContent } = req.body;

    // Basic validation
    if (!msgContent) {
      return res.status(400).json({
        Status: "Fail",
        Error: "Message content is required",
      });
    }

    await SlackService.sendMessageToSlack(fromEmail || "Anonymous", msgContent);

    res.json({
      Status: "Pass",
      Message: "Message sent to Slack successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      Status: "Fail",
      Error: error.message,
    });
  }
});

router.get("/GetChatGreetMessage", (req: Request, res: Response) => {
  try {
    const protocol = req.protocol;
    const host = req.get("host");
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    const responsePayload = {
      Status: "Pass",
      Input: fullUrl,
      Payload: {
        SessionId: "",
        Text: "Hey! 🕉️ Need clarity in life? I'm here to help!",
        TextHtml: "",
        MessageId: "e9012",
        FollowUpQuestions: [],
        Commands: ["noFeedback,noCuriosity"],
      },
    };

    res.json(responsePayload);
  } catch (error: any) {
    res.status(500).json({
      Status: "Fail",
      Error: error.message,
    });
  }
});

export default router;
