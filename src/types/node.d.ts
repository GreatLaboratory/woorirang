declare namespace NodeJS {
    interface Process {
      /** running on server */
      isServer: boolean
    }
    interface ProcessEnv {
      /** node environment */
      JWT_SECRET: string,
      COOKIE_SECRET: string,
      MYSQL_URI: string,
      MYSQL_DATABASE: string,
      MYSQL_USERNAME: string,
      MYSQL_PASSWORD: string,
      GMAIL_ID: string,
      GMAIL_PASSWORD: string,
    }
  }