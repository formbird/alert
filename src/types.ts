export interface SwalOptions {
  title?: string;
  text?: string;
  html?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question' | null;
  iconColor?: string;
  iconHtml?: string;
  footer?: string;
  backdrop?: boolean | string;
  width?: string | number;
  padding?: string;
  color?: string;
  background?: string;
  position?: 'center' | 'top' | 'top-start' | 'top-end' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end';
  grow?: 'row' | 'column' | 'fullscreen' | false;
  customClass?: {
    container?: string;
    popup?: string;
    header?: string;
    title?: string;
    closeButton?: string;
    icon?: string;
    image?: string;
    content?: string;
    input?: string;
    actions?: string;
    confirmButton?: string;
    denyButton?: string;
    cancelButton?: string;
    loader?: string;
    footer?: string;
    timerProgressBar?: string;
  };
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  showConfirmButton?: boolean;
  showDenyButton?: boolean;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  denyButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  denyButtonColor?: string;
  cancelButtonColor?: string;
  confirmButtonAriaLabel?: string;
  denyButtonAriaLabel?: string;
  cancelButtonAriaLabel?: string;
  buttonsStyling?: boolean;
  reverseButtons?: boolean;
  focusConfirm?: boolean;
  focusDeny?: boolean;
  focusCancel?: boolean;
  returnFocus?: boolean;
  input?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'range' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file' | 'url';
  inputPlaceholder?: string;
  inputLabel?: string;
  inputValue?: string;
  inputOptions?: Record<string, string>;
  inputAutoTrim?: boolean;
  inputAttributes?: Record<string, string>;
  inputValidator?: (value: any) => Promise<string | null> | string | null;
  validationMessage?: string;
  toast?: boolean;
  showClass?: { popup?: string };
  hideClass?: { popup?: string };
  timer?: number;
  timerProgressBar?: boolean;
  allowOutsideClick?: boolean;
  allowEscapeKey?: boolean;
  allowEnterKey?: boolean;
  stopKeydownPropagation?: boolean;
  keydownListenerCapture?: boolean;
  heightAuto?: boolean;
  scrollbarPadding?: boolean;
  willOpen?: (popup: HTMLElement) => void;
  didOpen?: (popup: HTMLElement) => void;
  willClose?: (popup: HTMLElement) => void;
  didClose?: () => void;
  didDestroy?: () => void;
  preConfirm?: (inputValue: any) => Promise<any> | any;
  preDeny?: () => Promise<any> | any;
  target?: HTMLElement;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  showCloseButton?: boolean;
  titleText?: string;
  animation?: boolean;
}

// Define the result type
export interface SwalResult {
  isConfirmed: boolean;
  isDenied: boolean;
  isDismissed: boolean;
  value?: any;
}

// Define the methods that will be available on the Swal object
export interface SwalMethods {
  fire(options?: SwalOptions | string): Promise<SwalResult>;
  close(): void;
  getTitle(): HTMLElement | null;
  getText(): HTMLElement | null;
  getIcon(): HTMLElement | null;
  getImage(): HTMLElement | null;
  getActions(): HTMLElement | null;
  getConfirmButton(): HTMLElement | null;
  getDenyButton(): HTMLElement | null;
  getCancelButton(): HTMLElement | null;
  getFooter(): HTMLElement | null;
  getInput(): HTMLElement | null;
  enableButtons(): void;
  disableButtons(): void;
  showLoading(): void;
  hideLoading(): void;
  isVisible(): boolean;
  clickConfirm(): void;
  clickCancel(): void;
  showValidationMessage(message: string): void;
  resetValidationMessage(): void;
  disableInput(): void;
  enableInput(): void;
  getContent(): HTMLElement | null;
  disableConfirmButton(): void;
  enableConfirmButton(): void;
  isValidParameter(param: string): boolean;
  version: string;
}

// Define the callable interface that extends SwalMethods
export interface SwalInstance extends SwalMethods {
  (options?: SwalOptions | string): Promise<SwalResult>;
  fire(options?: SwalOptions | string): Promise<SwalResult>;
  version: string;
}

export interface CallableSwalInstance extends SwalInstance {
    (options?: SwalOptions | string): Promise<SwalResult>;
}