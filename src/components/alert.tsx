import React, { useCallback, useEffect, useRef, useState } from 'react';

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

    return (
        <dialog
            className="modal_frame"
            ref={ref}
            onClose={useCallback(() => onClose(false), [onClose])}
        >
            <p className="modal_title">${title}</p>
            <div className="modal_buttons">
                <button type="button" onClick={useCallback(() => onClose(false), [onClose])}>Cancel</button>
                <button
                    autoFocus
                    className="primary"
                    type="button"
                    onClick={useCallback(() => onClose(true), [onClose])}
                >OK</button>
            </div>
        </dialog>
    );
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

    return (
        <Alert
            open={open}
            title={title}
            onClose={handleClose}
        />
    );
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
     
    // FIXME: Memory leak. This will not be cleaned up.
    window.addEventListener('confirmed', handleClose);
});
