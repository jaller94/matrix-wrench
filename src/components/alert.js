import { html, useCallback, useEffect, useRef, useState } from 'htm/preact/standalone.module.js';

export function Alert({open, title, onClose}) {
    const ref = useRef();

    useEffect(() => {
        if (open) {
            ref.current?.showModal();
            // prevent bg scroll
            document.body.classList.add('modal-open');
        } else {
            ref.current?.close();
            document.body.classList.remove('modal-open');
        }
    }, [open]);

    return html`
        <dialog
            class="modal_frame"
            ref=${ref}
            onClose=${useCallback(() => onClose(false), [onClose])}
        >
            <p class="modal_title">${title}</p>
            <div class="modal_buttons">
                <button type="button" onClick=${useCallback(() => onClose(false), [onClose])}>Cancel</button>
                <button
                    autoFocus
                    class="primary"
                    type="button"
                    onClick=${useCallback(() => onClose(true), [onClose])}
                >OK</button>
            </div>
        </dialog>
    `;
}

export function AlertSingleton() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const handleConfirmDialog = event => {
            setTitle(event.detail.title);
            setOpen(true);
        }
        window.addEventListener('confirm', handleConfirmDialog);
        return () => {
            window.removeEventListener('confirm', handleConfirmDialog);
        };
    }, []);
    
    const handleClose = (response) => {
        setOpen(false);
        window.dispatchEvent(new CustomEvent('confirmed', {
            detail: {
                response,
            },
        }));
    };

    return html`
        <${Alert}
            open=${open}
            title=${title}
            onClose=${handleClose}
        />
    `;
}

export const confirm = (title) => new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('confirm', {
        detail: {
            title,
        },
    }));
    const handleClose = async (event) => {
        resolve(event.detail.response);
    }
    // eslint-disable-next-line no-warning-comments
    // FIXME: Memory leak. This will not be cleaned up.
    window.addEventListener('confirmed', handleClose);
});
