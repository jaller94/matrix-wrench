import { html, useCallback, useEffect, useRef, useState } from '../node_modules/htm/preact/standalone.module.js';

export function Alert({open, title, onClose}) {
    const ref = useRef();

    useEffect(() => {
        console.log('open', open, ref.current);
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
                    autofocus
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
            console.log('confirm event', event);
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
        console.log('confirmed', response);
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
    console.log('confirm', title);
    window.dispatchEvent(new CustomEvent('confirm', {
        detail: {
            title,
        },
    }));
    const handleClose = async (event) => {
        resolve(event.detail.response);
    }
    // FIXME: Memory leak. This will not be cleaned up.
    window.addEventListener('confirmed', handleClose);
});
