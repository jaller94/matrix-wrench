import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

export const Alert: FC<{ open: boolean, title: string, onClose: (open: boolean) => void }> = ({open, title, onClose}) => {
    const ref = useRef<HTMLDialogElement | null>(null);

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
            <p className="modal_title">{title}</p>
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

export const AlertSingleton: FC = () => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const handleConfirmDialog = (event: Event) => {
            setTitle(event.detail.title);
            setOpen(true);
        }
        globalThis.addEventListener('confirm', handleConfirmDialog);
        return () => {
            globalThis.removeEventListener('confirm', handleConfirmDialog);
        };
    }, []);
    
    const handleClose = (response: boolean) => {
        setOpen(false);
        globalThis.dispatchEvent(new CustomEvent('confirmed', {
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

export const confirm = (title: string) => new Promise((resolve) => {
    globalThis.dispatchEvent(new CustomEvent('confirm', {
        detail: {
            title,
        },
    }));
    const handleClose = (event: Event) => {
        resolve(event.detail.response);
    }
     
    // FIXME: Memory leak. This will not be cleaned up.
    globalThis.addEventListener('confirmed', handleClose);
});
