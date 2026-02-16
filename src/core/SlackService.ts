import axios from "axios";

export class SlackService {
  /**
   * Sends a message to Slack using a webhook.
   * Matches the structure of the C# implementation.
   */
  static async sendMessageToSlack(
    fromEmail: string,
    msgContent: string,
  ): Promise<void> {
    const webhookUrl = process.env.SLACK_EMAIL_WEBHOOK;

    if (!webhookUrl) {
      console.warn(
        "Slack webhook URL is not configured (SLACK_EMAIL_WEBHOOK).",
      );
      return; // Or throw error depending on desired behavior
    }

    const model = {
      username: "Acmebot",
      attachments: [
        {
          text: "New Message",
          color: "good",
          fields: [
            {
              title: "From",
              value: fromEmail,
              short: false,
            },
            {
              title: "Content",
              value: msgContent,
              short: false,
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(webhookUrl, model, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Slack response:", response.data);
    } catch (error: any) {
      console.error(
        "Error sending message to Slack:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to send message to Slack");
    }
  }
}
