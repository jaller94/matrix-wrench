import { html, useCallback, useEffect, useState } from '../node_modules/htm/preact/standalone.module.js';
import {
    uniqueId,
} from '../helper.js';

export function BulkActionForm({actionLabel, onSubmit}) {
    const [userIdsString, setUserIdsString] = useState('');

    const handleSubmit = useCallback(async event => {
        event.preventDefault();
        event.stopPropagation();
        let userIds = userIdsString.split(/[\s,;]/);
        userIds = userIds.map(userIds => userIds.trim());
        const userIdRegExp = /^@.*:/;
        userIds = userIds.filter(userId => userIdRegExp.test(userId));
        await onSubmit({
            userIds,
        });
    }, [userIdsString, onSubmit]);

    return html`
        <form onsubmit=${handleSubmit}>
            <label>
                User IDs (separated by spaces, new lines, commas or semi-colons)
                <textarea
                    value=${userIdsString}
                    oninput=${useCallback(({target}) => setUserIdsString(target.value), [])}
                />
            </label>
            <button class="primary">${actionLabel}</button>
        </form>
    `;
}

export function BulkActionTracker({action, items}) {
    const [currentItem, setCurrentItem] = useState(null);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState([]);
    // const [pendingItems, setPendingItems] = useState(items);
    const [allItems, setAllItems] = useState(items);

    useEffect(() => {
        // TODO: Intelligently add new items to the queue and remove deleted ones.
        if (allItems.length !== 0) {
            return;
        }
        setAllItems(items);
    }, [allItems, items]);

    useEffect(() => {
        async function doAction() {
            for (const item of allItems) {
                try {
                    setCurrentItem(item);
                    await action(item);
                } catch (error) {
                    setErrors(errors => [
                        ...errors,
                        {
                            id: uniqueId(),
                            item,
                            message: error.content?.errcode || error.message,
                        },
                    ]);
                }
                setProgress(value => value + 1);
            }
            setCurrentItem(null);
        }
        doAction();
    }, [action, allItems]);

    // FIXME: error.item can be an object. Cannot use JSON.stringify()
    return html`
        <h3>Progress</h3>
        <progress value=${progress} max=${allItems.length}>Processed ${progress} of ${allItems.length} items.</progress>
        ${currentItem ? html`
            Processing ${currentItem}…
        ` : html`
            ${progress} / ${allItems.length}
        `}
        <h3>Errors (${errors.length})</h3>
        ${errors.length === 0 ? html`<p>No errors</p>` : html`
            <ol>
                ${errors.map(error => html`<li key=${error.id}>${`${error.item}`} - ${error.message}</li>`)}
            </ol>
        `}
    `;
}
