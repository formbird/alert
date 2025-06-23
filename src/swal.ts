import './styles.css';
import { SwalOptions, SwalResult, SwalMethods, SwalInstance } from './types';

class SwalClone implements SwalMethods {
    private currentDialog: HTMLDialogElement | null = null;
    private currentTimer: ReturnType<typeof setTimeout> | null = null;
    public version = '1.0.0';

    private defaults: SwalOptions = {
        title: '',
        text: '',
        html: '',
        icon: undefined,
        iconColor: undefined,
        iconHtml: undefined,
        footer: '',
        backdrop: true,
        width: '32em',
        padding: undefined,
        color: undefined,
        background: undefined,
        position: 'center',
        grow: false,
        customClass: {},
        imageUrl: undefined,
        imageWidth: undefined,
        imageHeight: undefined,
        imageAlt: '',
        showConfirmButton: true,
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: 'OK',
        denyButtonText: 'No',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#007bff',
        denyButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonAriaLabel: '',
        denyButtonAriaLabel: '',
        cancelButtonAriaLabel: '',
        buttonsStyling: true,
        reverseButtons: false,
        focusConfirm: true,
        focusDeny: false,
        focusCancel: false,
        returnFocus: true,
        input: undefined,
        inputPlaceholder: '',
        inputLabel: '',
        inputValue: '',
        inputOptions: {},
        inputAutoTrim: true,
        inputAttributes: {},
        inputValidator: undefined,
        validationMessage: undefined,
        toast: false,
        showClass: {
            popup: 'swal-show'
        },
        hideClass: {
            popup: 'swal-hide'
        },
        timer: undefined,
        timerProgressBar: false,
        allowOutsideClick: true,
        allowEscapeKey: true,
        allowEnterKey: true,
        stopKeydownPropagation: true,
        keydownListenerCapture: false,
        heightAuto: true,
        scrollbarPadding: true,
    };

    fire(options?: SwalOptions | string): Promise<SwalResult> {
        return new Promise((resolve) => {
            const config = typeof options === 'string'
                ? { ...this.defaults, text: options }
                : { ...this.defaults, ...options };

            // Close existing dialog
            this.close();

            // Create dialog element
            const dialog = document.createElement('dialog') as HTMLDialogElement;
            dialog.className = 'swal2-modal';

            // Apply custom positioning
            if (config.position !== 'center') {
                dialog.classList.add(`swal2-position-${config.position}`);
            }

            // Create container
            const container = document.createElement('div');
            container.className = 'swal2-container';

            // Apply custom styling
            if (config.width) {
                const width = typeof config.width === 'number' ? `${config.width}px` : config.width;
                dialog.style.width = width;
                container.style.width = width;
            }
            if (config.padding) container.style.padding = config.padding;
            if (config.color) container.style.color = config.color;
            if (config.background) container.style.background = config.background;

            // Add custom classes
            if (config.customClass?.container) {
                container.classList.add(config.customClass.container);
            }

            // Build content
            this.buildContent(container, config);

            dialog.appendChild(container);
            (config.target || document.body).appendChild(dialog);

            this.currentDialog = dialog;

            // Handle toast mode
            if (config.toast) {
                dialog.classList.add('swal-toast');
                dialog.style.position = 'fixed';
                dialog.style.top = '20px';
                dialog.style.right = '20px';
                dialog.style.zIndex = '10000';
            }

            // Event handlers
            this.attachEventHandlers(dialog, config, resolve);

            // Show dialog
            if (config.willOpen) config.willOpen(dialog);

            if (config.toast) {
                dialog.style.display = 'block';
            } else {
                dialog.showModal();
            }

            dialog.classList.add(config.showClass?.popup || 'swal-show');

            if (config.didOpen) config.didOpen(dialog);

            // Handle timer
            if (config.timer) {
                this.startTimer(config.timer, config.timerProgressBar || false, dialog, resolve);
            }

            // Focus handling
            setTimeout(() => {
                if (config.focusConfirm && this.getConfirmButton()) {
                    this.getConfirmButton()?.focus();
                } else if (config.focusDeny && this.getDenyButton()) {
                    this.getDenyButton()?.focus();
                } else if (config.focusCancel && this.getCancelButton()) {
                    this.getCancelButton()?.focus();
                }
            }, 100);
        });
    }

    private buildContent(container: HTMLElement, config: SwalOptions): void {
        // Icon
        if (config.icon) {
            const iconEl = document.createElement('div');
            iconEl.className = `swal2-icon swal2-${config.icon}`;

            if (config.iconHtml) {
                iconEl.innerHTML = config.iconHtml;
            } else {
                const iconSymbols: Record<string, string> = {
                    success: '✓',
                    error: '✕',
                    warning: '⚠',
                    info: 'ℹ',
                    question: '?'
                };
                iconEl.textContent = iconSymbols[config.icon] || '';
            }

            if (config.iconColor) {
                iconEl.style.color = config.iconColor;
            }

            container.appendChild(iconEl);
        }

        // Image
        if (config.imageUrl) {
            const img = document.createElement('img');
            img.src = config.imageUrl;
            img.className = 'swal2-image';
            img.alt = config.imageAlt || '';
            if (config.imageWidth) img.style.width = config.imageWidth + 'px';
            if (config.imageHeight) img.style.height = config.imageHeight + 'px';
            container.appendChild(img);
        }

        // Close button
        if (config.showCloseButton) {
            const closeButton = document.createElement('button');
            closeButton.className = 'swal2-close';
            closeButton.innerHTML = '×';
            closeButton.setAttribute('aria-label', 'Close');
            container.appendChild(closeButton);
        }

        // Title
        if (config.title || config.titleText) {
            const titleEl = document.createElement('h2');
            titleEl.className = 'swal2-title';
            if (config.title) {
                titleEl.innerHTML = config.title;
            } else if (config.titleText) {
                titleEl.textContent = config.titleText;
            }
            container.appendChild(titleEl);
        }

        // Content
        const contentEl = document.createElement('div');
        contentEl.className = 'swal2-content';

        if (config.html) {
            contentEl.innerHTML = config.html;
        } else if (config.text) {
            const textEl = document.createElement('div');
            textEl.className = 'swal2-text';
            textEl.textContent = config.text;
            contentEl.appendChild(textEl);
        }

        // Input
        if (config.input) {
            const inputEl = this.createInput(config);
            contentEl.appendChild(inputEl);

            // Validation message
            const validationEl = document.createElement('div');
            validationEl.className = 'swal2-validation-message';
            contentEl.appendChild(validationEl);
        }

        container.appendChild(contentEl);

        // Actions
        this.buildActions(container, config);

        // Footer
        if (config.footer) {
            const footerEl = document.createElement('div');
            footerEl.className = 'swal2-footer';
            footerEl.innerHTML = config.footer;
            container.appendChild(footerEl);
        }

        // Timer progress bar
        if (config.timerProgressBar) {
            const progressEl = document.createElement('div');
            progressEl.className = 'swal2-timer-progress-bar';
            const progressInner = document.createElement('div');
            progressInner.className = 'swal2-timer-progress-bar-inner';
            progressEl.appendChild(progressInner);
            container.appendChild(progressEl);
        }
    }

    private createInput(config: SwalOptions): HTMLElement {
        let inputEl: HTMLElement;
        let checkbox: HTMLInputElement;
        let range: HTMLInputElement;

        switch (config.input) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
            case 'tel':
            case 'url':
                inputEl = document.createElement('input');
                (inputEl as HTMLInputElement).type = config.input;
                break;
            case 'textarea':
                inputEl = document.createElement('textarea');
                break;
            case 'select':
                inputEl = document.createElement('select');
                Object.entries(config.inputOptions || {}).forEach(([value, text]) => {
                    const option = document.createElement('option');
                    option.value = value;
                    option.textContent = text;
                    inputEl.appendChild(option);
                });
                break;
            case 'radio':
                inputEl = document.createElement('div');
                inputEl.className = 'swal2-radio';
                Object.entries(config.inputOptions || {}).forEach(([value, text]) => {
                    const label = document.createElement('label');
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'swal2-radio';
                    radio.value = value;
                    label.appendChild(radio);
                    label.appendChild(document.createTextNode(text));
                    inputEl.appendChild(label);
                });
                break;
            case 'checkbox':
                inputEl = document.createElement('div');
                inputEl.className = 'swal2-checkbox';
                checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                inputEl.appendChild(checkbox);
                break;
            case 'range':
                inputEl = document.createElement('div');
                inputEl.className = 'swal2-range';
                range = document.createElement('input');
                range.type = 'range';
                inputEl.appendChild(range);
                break;
            case 'file':
                inputEl = document.createElement('input');
                (inputEl as HTMLInputElement).type = 'file';
                break;
            default:
                inputEl = document.createElement('input');
                (inputEl as HTMLInputElement).type = 'text';
        }

        if (!inputEl.className) {
            inputEl.className = 'swal2-input';
        }
        if (config.inputPlaceholder && 'placeholder' in inputEl) {
            (inputEl as HTMLInputElement).placeholder = config.inputPlaceholder;
        }
        if (config.inputValue && 'value' in inputEl) {
            (inputEl as HTMLInputElement).value = config.inputValue;
        }

        // Apply input attributes
        Object.entries(config.inputAttributes || {}).forEach(([key, value]) => {
            inputEl.setAttribute(key, value);
        });

        return inputEl;
    }

    private buildActions(container: HTMLElement, config: SwalOptions): void {
        if (!config.showConfirmButton && !config.showDenyButton && !config.showCancelButton) {
            return;
        }

        const actionsEl = document.createElement('div');
        actionsEl.className = 'swal2-buttonswrapper';

        const buttons: HTMLButtonElement[] = [];

        if (config.showConfirmButton) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'swal2-confirm';
            if (config.confirmButtonClass) {
                confirmBtn.classList.add(...config.confirmButtonClass.split(' '));
            }
            confirmBtn.textContent = config.confirmButtonText || 'OK';
            confirmBtn.style.backgroundColor = config.confirmButtonColor || '#007bff';
            if (config.confirmButtonAriaLabel) {
                confirmBtn.setAttribute('aria-label', config.confirmButtonAriaLabel);
            }
            buttons.push(confirmBtn);
        }

        if (config.showDenyButton) {
            const denyBtn = document.createElement('button');
            denyBtn.className = 'swal2-deny';
            denyBtn.textContent = config.denyButtonText || 'No';
            denyBtn.style.backgroundColor = config.denyButtonColor || '#dc3545';
            if (config.denyButtonAriaLabel) {
                denyBtn.setAttribute('aria-label', config.denyButtonAriaLabel);
            }
            buttons.push(denyBtn);
        }

        if (config.showCancelButton) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'swal2-cancel';
            if (config.cancelButtonClass) {
                cancelBtn.classList.add(...config.cancelButtonClass.split(' '));
            }
            cancelBtn.textContent = config.cancelButtonText || 'Cancel';
            cancelBtn.style.backgroundColor = config.cancelButtonColor || '#6c757d';
            if (config.cancelButtonAriaLabel) {
                cancelBtn.setAttribute('aria-label', config.cancelButtonAriaLabel);
            }
            buttons.push(cancelBtn);
        }

        if (config.reverseButtons) {
            buttons.reverse();
        }

        buttons.forEach(btn => actionsEl.appendChild(btn));
        container.appendChild(actionsEl);
    }

    private attachEventHandlers(dialog: HTMLDialogElement, config: SwalOptions, resolve: (value: SwalResult) => void): void {
        const confirmBtn = dialog.querySelector('.swal2-confirm') as HTMLButtonElement;
        const denyBtn = dialog.querySelector('.swal2-deny') as HTMLButtonElement;
        const cancelBtn = dialog.querySelector('.swal2-cancel') as HTMLButtonElement;
        const input = dialog.querySelector('.swal2-input') as HTMLInputElement;

        // Confirm button
        if (confirmBtn) {
            confirmBtn.addEventListener('click', async (e: MouseEvent) => {
                e.preventDefault();

                let inputValue = null;
                if (input) {
                    inputValue = this.getInputValue(input);

                    // Validation
                    if (config.inputValidator) {
                        const validationResult = await config.inputValidator(inputValue);
                        if (validationResult) {
                            this.showValidationMessage(validationResult);
                            return;
                        }
                    }
                }

                if (config.preConfirm) {
                    const result = await config.preConfirm(inputValue);
                    if (result === false) return;
                }

                this.close();
                resolve({
                    isConfirmed: true,
                    isDenied: false,
                    isDismissed: false,
                    value: inputValue
                });
            });
        }

        // Deny button
        if (denyBtn) {
            denyBtn.addEventListener('click', async (e: MouseEvent) => {
                e.preventDefault();

                if (config.preDeny) {
                    const result = await config.preDeny();
                    if (result === false) return;
                }

                this.close();
                resolve({
                    isConfirmed: false,
                    isDenied: true,
                    isDismissed: false,
                    value: null
                });
            });
        }

        // Cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                this.close();
                resolve({
                    isConfirmed: false,
                    isDenied: false,
                    isDismissed: true,
                    value: null
                });
            });
        }

        // Outside click
        if (config.allowOutsideClick && !config.toast) {
            dialog.addEventListener('click', (e: MouseEvent) => {
                if (e.target === dialog) {
                    this.close();
                    resolve({
                        isConfirmed: false,
                        isDenied: false,
                        isDismissed: true,
                        value: null
                    });
                }
            });
        }

        // Keyboard events
        if (config.allowEscapeKey || config.allowEnterKey) {
            const keyHandler = (e: KeyboardEvent) => {
                if (
                    (config.allowEscapeKey && e.key === 'Escape') ||
                    (config.allowEnterKey && e.key === 'Enter' && !e.shiftKey)
                ) {
                    e.preventDefault();
                    this.close();
                    resolve({
                        isConfirmed: false,
                        isDenied: false,
                        isDismissed: true,
                        value: null
                    });
                }
            };

            document.addEventListener('keydown', keyHandler);
            (dialog as any)._keyHandler = keyHandler;
        }
    }

    getInputValue(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): any {
        if (input instanceof HTMLInputElement) {
            if (input.type === 'checkbox') {
                return input.checked;
            } else if (input.type === 'radio') {
                const checked = this.currentDialog?.querySelector('input[type="radio"]:checked') as HTMLInputElement;
                return checked ? checked.value : null;
            }
            return input.value;
        } else if (input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
            return input.value;
        }
        return null;
    }

    showLoading(): void {
        this.disableButtons();
        const confirmButton = this.getConfirmButton();
        if (confirmButton) {
            const loader = document.createElement('div');
            loader.className = 'swal-loading';
            confirmButton.appendChild(loader);
            confirmButton.disabled = true;
        }
    }

    hideLoading(): void {
        this.enableButtons();
        const confirmButton = this.getConfirmButton();
        if (confirmButton) {
            const loader = confirmButton.querySelector('.swal-loading');
            loader?.remove();
            confirmButton.disabled = false;
        }
    }

    startTimer(duration: number, showProgressBar: boolean, dialog: HTMLDialogElement, resolve: (value: SwalResult) => void): void {
        if (showProgressBar) {
            const progressBar = dialog.querySelector('.swal2-timer-progress-bar-inner') as HTMLElement;
            if (progressBar) {
                progressBar.style.transition = `width ${duration}ms linear`;
                progressBar.style.width = '0%';
                // Force reflow
                progressBar.offsetHeight;
                progressBar.style.width = '100%';
            }
        }

        this.currentTimer = setTimeout(() => {
            this.close();
            resolve({
                isConfirmed: false,
                isDenied: false,
                isDismissed: true,
                value: null
            });
        }, duration);
    }

    showValidationMessage(message: string): void {
        const validationEl = this.currentDialog?.querySelector('.swal2-validation-message') as HTMLElement;
        if (validationEl) {
            validationEl.textContent = message;
            validationEl.style.display = 'block';
        }
    }

    resetValidationMessage(): void {
        const validationEl = this.currentDialog?.querySelector('.swal2-validation-message') as HTMLElement;
        if (validationEl) {
            validationEl.style.display = 'none';
        }
    }

    disableInput(): void {
        const input = this.getInput() as HTMLInputElement;
        if (input) input.disabled = true;
    }

    enableInput(): void {
        const input = this.getInput() as HTMLInputElement;
        if (input) input.disabled = false;
    }

    enableButtons(): void {
        const buttons = this.currentDialog?.querySelectorAll('.swal-button');
        buttons?.forEach(btn => (btn as HTMLButtonElement).disabled = false);
    }

    disableButtons(): void {
        const buttons = this.currentDialog?.querySelectorAll('.swal-button');
        buttons?.forEach(btn => (btn as HTMLButtonElement).disabled = true);
    }

    clickConfirm(): void {
        this.getConfirmButton()?.click();
    }

    clickCancel(): void {
        this.getCancelButton()?.click();
    }

    close(): void {
        if (this.currentDialog) {
            if (this.currentTimer) {
                clearTimeout(this.currentTimer);
                this.currentTimer = null;
            }
            if ('open' in this.currentDialog) {
                this.currentDialog.close();
            }
            this.currentDialog = null;
        }
    }

    getTitle(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal2-title') as HTMLElement || null;
    }

    getText(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal2-text') as HTMLElement || null;
    }

    getIcon(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal2-icon') as HTMLElement || null;
    }

    getImage(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal2-image') as HTMLElement || null;
    }

    getActions(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal2-buttonswrapper') as HTMLElement || null;
    }

    getConfirmButton(): HTMLButtonElement | null {
        return this.currentDialog?.querySelector('.swal2-confirm') as HTMLButtonElement || null;
    }

    getDenyButton(): HTMLButtonElement | null {
        return this.currentDialog?.querySelector('.swal2-deny') as HTMLButtonElement || null;
    }

    getCancelButton(): HTMLButtonElement | null {
        return this.currentDialog?.querySelector('.swal2-cancel') as HTMLButtonElement || null;
    }

    getFooter(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal2-footer') as HTMLElement || null;
    }

    getInput(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal2-input') as HTMLElement || null;
    }

    getContent(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal2-content') as HTMLElement || null;
    }

    isVisible(): boolean {
        return this.currentDialog?.open || false;
    }

    disableConfirmButton(): void {
        const button = this.getConfirmButton();
        if (button) button.disabled = true;
    }

    enableConfirmButton(): void {
        const button = this.getConfirmButton();
        if (button) button.disabled = false;
    }

    isValidParameter(param: string): boolean {
        const validParams = new Set([
            'title', 'text', 'html', 'icon', 'iconColor', 'iconHtml', 'footer', 'backdrop',
            'width', 'padding', 'color', 'background', 'position', 'grow', 'customClass',
            'imageUrl', 'imageWidth', 'imageHeight', 'imageAlt', 'showConfirmButton',
            'showDenyButton', 'showCancelButton', 'confirmButtonText', 'denyButtonText',
            'cancelButtonText', 'confirmButtonColor', 'denyButtonColor', 'cancelButtonColor',
            'confirmButtonAriaLabel', 'denyButtonAriaLabel', 'cancelButtonAriaLabel',
            'buttonsStyling', 'reverseButtons', 'focusConfirm', 'focusDeny', 'focusCancel',
            'returnFocus', 'input', 'inputPlaceholder', 'inputLabel', 'inputValue',
            'inputOptions', 'inputAutoTrim', 'inputAttributes', 'inputValidator',
            'validationMessage', 'toast', 'showClass', 'hideClass', 'timer',
            'timerProgressBar', 'allowOutsideClick', 'allowEscapeKey', 'allowEnterKey',
            'stopKeydownPropagation', 'keydownListenerCapture', 'heightAuto',
            'scrollbarPadding', 'willOpen', 'didOpen', 'willClose', 'didClose',
            'didDestroy', 'preConfirm', 'preDeny', 'target', 'confirmButtonClass',
            'cancelButtonClass', 'showCloseButton', 'titleText', 'animation'
        ]);
        return validParams.has(param);
    }
}

function createSwalInstance(): SwalInstance {
    const instance = new SwalClone();
    
    // Create the callable instance
    const callable = function(options?: SwalOptions | string) {
        return instance.fire(options);
    } as SwalInstance;

    // Copy methods from instance to callable
    Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
        .filter(name => name !== 'constructor')
        .forEach(name => {
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), name);
            if (descriptor) {
                Object.defineProperty(callable, name, {
                    ...descriptor,
                    value: descriptor.value?.bind(instance)
                });
            }
        });

    // Add version property
    Object.defineProperty(callable, 'version', {
        get: () => instance.version
    });

    return callable;
}

// Create and export the default instance
const Swal = createSwalInstance();

// Make it global
if (typeof window !== 'undefined') {
    (window as any).Swal = Swal;
    (window as any).swal = Swal; // For compatibility
}

export default Swal;