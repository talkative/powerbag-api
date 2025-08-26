declare module 'nodemailer-mandrill-transport' {
  import { Transporter } from 'nodemailer';

  interface MandrillTransportOptions {
    auth: {
      apiKey: string;
    };
  }

  interface MandrillMessage {
    global_merge_vars?: any[];
    merge_vars?: any[];
    tags?: string[];
    subaccount?: string;
    google_analytics_domains?: string[];
    google_analytics_campaign?: string;
    metadata?: { [key: string]: any };
    recipient_metadata?: any[];
    attachments?: any[];
    images?: any[];
  }

  interface MandrillOptions {
    message?: MandrillMessage;
    merge?: boolean;
    merge_language?: string;
    template_name?: string;
    template_content?: any[];
  }

  interface MandrillMailOptions {
    from?: string;
    to?: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string;
    subject?: string;
    text?: string;
    html?: string;
    mandrillOptions?: MandrillOptions;
  }

  function mandrillTransport(options: MandrillTransportOptions): Transporter;
  export = mandrillTransport;
}

declare module 'nodemailer' {
  interface Options {
    mandrillOptions?: {
      message?: {
        global_merge_vars?: any[];
        merge_vars?: any[];
        tags?: string[];
        subaccount?: string;
        google_analytics_domains?: string[];
        google_analytics_campaign?: string;
        metadata?: { [key: string]: any };
        recipient_metadata?: any[];
        attachments?: any[];
        images?: any[];
      };
      merge?: boolean;
      merge_language?: string;
      template_name?: string;
      template_content?: any[];
    };
  }
}
