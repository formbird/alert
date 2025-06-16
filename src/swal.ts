import { SwalOptions, SwalResult, SwalInstance } from './types';

export class SwalClone implements SwalInstance {
    private currentDialog: HTMLDialogElement | null = null;
    private currentTimer: ReturnType<typeof setTimeout> | null = null;

    private defaults: SwalOptions = {
        title: '',
        text: '',
        html: '',
        icon: undefined,
        iconColor: undefined,
        iconHtml: undefined,
        footer: '',
        backdrop: true,
        width: undefined,
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
        showClass: { popup: 'swal-show' },
        hideClass: { popup: 'swal-hide' },
        timer: undefined,
        timerProgressBar: false,
        allowOutsideClick: true,
        allowEscapeKey: true,
        allowEnterKey: true,
        stopKeydownPropagation: true,
        keydownListenerCapture: false,
        heightAuto: true,
        scrollbarPadding: true,
        willOpen: undefined,
        didOpen: undefined,
        willClose: undefined,
        didClose: undefined,
        didDestroy: undefined,
        preConfirm: undefined,
        preDeny: undefined,
        target: document.body
    };

    fire(options: SwalOptions = {}): Promise<SwalResult> {
        return new Promise((resolve) => {
            const config = { ...this.defaults, ...options };

            // Close existing dialog
            this.close();

            // Create dialog element
            const dialog = document.createElement('dialog') as HTMLDialogElement;
            dialog.className = 'swal-dialog';

            // Apply custom positioning
            if (config.position !== 'center') {
                dialog.classList.add(`swal-position-${config.position}`);
            }

            // Create container
            const container = document.createElement('div');
            container.className = 'swal-container';

            // Apply custom styling
            if (config.width) container.style.width = typeof config.width === 'number' ? config.width + 'px' : config.width;
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
            iconEl.className = `swal-icon ${config.icon}`;

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
            img.className = 'swal-image';
            img.alt = config.imageAlt || '';
            if (config.imageWidth) img.style.width = config.imageWidth + 'px';
            if (config.imageHeight) img.style.height = config.imageHeight + 'px';
            container.appendChild(img);
        }

        // Title
        if (config.title) {
            const titleEl = document.createElement('h2');
            titleEl.className = 'swal-title';
            titleEl.textContent = config.title;
            container.appendChild(titleEl);
        }

        // Content
        const contentEl = document.createElement('div');
        contentEl.className = 'swal-content';

        if (config.html) {
            contentEl.innerHTML = config.html;
        } else if (config.text) {
            const textEl = document.createElement('div');
            textEl.className = 'swal-text';
            textEl.textContent = config.text;
            contentEl.appendChild(textEl);
        }

        // Input
        if (config.input) {
            const inputEl = this.createInput(config);
            contentEl.appendChild(inputEl);

            // Validation message
            const validationEl = document.createElement('div');
            validationEl.className = 'swal-validation-message';
            contentEl.appendChild(validationEl);
        }

        container.appendChild(contentEl);

        // Actions
        this.buildActions(container, config);

        // Footer
        if (config.footer) {
            const footerEl = document.createElement('div');
            footerEl.className = 'swal-footer';
            footerEl.innerHTML = config.footer;
            container.appendChild(footerEl);
        }

        // Timer progress bar
        if (config.timerProgressBar) {
            const progressEl = document.createElement('div');
            progressEl.className = 'swal-timer-progress-bar';
            const progressInner = document.createElement('div');
            progressInner.className = 'swal-timer-progress-bar-inner';
            progressEl.appendChild(progressInner);
            container.appendChild(progressEl);
        }
    }

    private createInput(config: SwalOptions): HTMLElement {
        let inputEl: HTMLElement;

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
                Object.entries(config.inputOptions || {}).forEach(([value, text]) => {
                    const label = document.createElement('label');
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = 'swal-radio';
                    radio.value = value;
                    label.appendChild(radio);
                    label.appendChild(document.createTextNode(text));
                    inputEl.appendChild(label);
                });
                break;
            case 'checkbox':
                inputEl = document.createElement('input');
                (inputEl as HTMLInputElement).type = 'checkbox';
                break;
            case 'range':
                inputEl = document.createElement('input');
                (inputEl as HTMLInputElement).type = 'range';
                break;
            case 'file':
                inputEl = document.createElement('input');
                (inputEl as HTMLInputElement).type = 'file';
                break;
            default:
                inputEl = document.createElement('input');
                (inputEl as HTMLInputElement).type = 'text';
        }

        inputEl.className = 'swal-input';
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
        actionsEl.className = 'swal-actions';

        const buttons: HTMLButtonElement[] = [];

        if (config.showConfirmButton) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = 'swal-button confirm';
            confirmBtn.textContent = config.confirmButtonText || 'OK';
            confirmBtn.style.backgroundColor = config.confirmButtonColor || '#007bff';
            if (config.confirmButtonAriaLabel) {
                confirmBtn.setAttribute('aria-label', config.confirmButtonAriaLabel);
            }
            buttons.push(confirmBtn);
        }

        if (config.showDenyButton) {
            const denyBtn = document.createElement('button');
            denyBtn.className = 'swal-button deny';
            denyBtn.textContent = config.denyButtonText || 'No';
            denyBtn.style.backgroundColor = config.denyButtonColor || '#dc3545';
            if (config.denyButtonAriaLabel) {
                denyBtn.setAttribute('aria-label', config.denyButtonAriaLabel);
            }
            buttons.push(denyBtn);
        }

        if (config.showCancelButton) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'swal-button cancel';
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
        const confirmBtn = dialog.querySelector('.swal-button.confirm') as HTMLButtonElement;
        const denyBtn = dialog.querySelector('.swal-button.deny') as HTMLButtonElement;
        const cancelBtn = dialog.querySelector('.swal-button.cancel') as HTMLButtonElement;
        const input = dialog.querySelector('.swal-input') as HTMLInputElement;

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
        const confirmButton = this.getConfirmButton();
        if (confirmButton) {
            confirmButton.innerHTML = '<div class="swal-loading"></div>';
            confirmButton.disabled = true;
        }
        this.disableButtons();
    }

    hideLoading(): void {
        const confirmButton = this.getConfirmButton();
        if (confirmButton) {
            confirmButton.innerHTML = this.defaults.confirmButtonText || 'OK';
            confirmButton.disabled = false;
        }
        this.enableButtons();
    }

    startTimer(duration: number, showProgressBar: boolean, dialog: HTMLDialogElement, resolve: (value: SwalResult) => void): void {
        if (showProgressBar) {
            const progressBar = dialog.querySelector('.swal-timer-progress-bar-inner') as HTMLElement;
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
        const validationEl = this.currentDialog?.querySelector('.swal-validation-message') as HTMLElement;
        if (validationEl) {
            validationEl.textContent = message;
            validationEl.style.display = 'block';
        }
    }

    resetValidationMessage(): void {
        const validationEl = this.currentDialog?.querySelector('.swal-validation-message') as HTMLElement;
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
        const buttons = this.currentDialog?.querySelectorAll('.swal-button') as NodeListOf<HTMLButtonElement>;
        buttons?.forEach(btn => btn.disabled = false);
    }

    disableButtons(): void {
        const buttons = this.currentDialog?.querySelectorAll('.swal-button') as NodeListOf<HTMLButtonElement>;
        buttons?.forEach(btn => btn.disabled = true);
    }

    clickConfirm(): void {
        const button = this.getConfirmButton();
        button?.click();
    }

    clickCancel(): void {
        const button = this.getCancelButton();
        button?.click();
    }

    close(): void {
        if (this.currentDialog) {
            if (this.currentTimer) {
                clearTimeout(this.currentTimer);
                this.currentTimer = null;
            }

            // Handle keyboard events cleanup
            if ((this.currentDialog as any)._keyHandler) {
                document.removeEventListener('keydown', (this.currentDialog as any)._keyHandler);
                delete (this.currentDialog as any)._keyHandler;
            }

            this.currentDialog.classList.add(this.defaults.hideClass?.popup || 'swal-hide');
            
            setTimeout(() => {
                if (this.currentDialog) {
                    if (this.currentDialog.open) {
                        this.currentDialog.close();
                    }
                    this.currentDialog.remove();
                    this.currentDialog = null;
                }
            }, 100);
        }
    }

    // Get methods that return specific HTML elements
    getTitle(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal-title') as HTMLElement || null;
    }

    getText(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal-text') as HTMLElement || null;
    }

    getIcon(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal-icon') as HTMLElement || null;
    }

    getImage(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal-image') as HTMLElement || null;
    }

    getActions(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal-actions') as HTMLElement || null;
    }

    getConfirmButton(): HTMLButtonElement | null {
        return this.currentDialog?.querySelector('.swal-button.confirm') as HTMLButtonElement || null;
    }

    getDenyButton(): HTMLButtonElement | null {
        return this.currentDialog?.querySelector('.swal-button.deny') as HTMLButtonElement || null;
    }

    getCancelButton(): HTMLButtonElement | null {
        return this.currentDialog?.querySelector('.swal-button.cancel') as HTMLButtonElement || null;
    }

    getFooter(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal-footer') as HTMLElement || null;
    }

    getInput(): HTMLElement | null {
        return this.currentDialog?.querySelector('.swal-input') as HTMLElement || null;
    }

    isVisible() {
        return this.currentDialog !== null;
    }
}