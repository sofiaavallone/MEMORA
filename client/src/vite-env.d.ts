/// <reference types="vite/client" />

interface GoogleCredentialResponse {
  credential?: string
}

interface GoogleIdConfiguration {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
}

interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?:
    | 'signin_with'
    | 'signup_with'
    | 'continue_with'
    | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  width?: number
}

interface GoogleAccountsIdApi {
  initialize(config: GoogleIdConfiguration): void
  renderButton(parent: HTMLElement, options: GoogleButtonConfiguration): void
}

interface GoogleAccountsApi {
  id: GoogleAccountsIdApi
}

interface GoogleApi {
  accounts: GoogleAccountsApi
}

interface Window {
  google?: GoogleApi
}
