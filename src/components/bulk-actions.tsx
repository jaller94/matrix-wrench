import React, { FC, FormEventHandler, useCallback, useEffect, useState } from 'react';
import {
    uniqueId,
} from '../helper.ts';

export const BulkActionForm: FC<{
    actionLabel: string,
    onSubmit: (res: {userIds: string[]}) => void,
}> = ({actionLabel, onSubmit}) => {
    const [userIdsString, setUserIdsString] = useState('');

    const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async event => {
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

    return (
        <form onSubmit={handleSubmit}>
            <label>
                User IDs (separated by spaces, new lines, commas or semi-colons)
                <textarea
                    value={userIdsString}
                    onInput={useCallback(({target}) => setUserIdsString(target.value), [])}
                />
            </label>
            <button className="primary">{actionLabel}</button>
        </form>
    );
};

export const BulkActionTracker: FC<{ action: (item: unknown) => Promise<void>, items: unknown[] }> = ({action, items}) => {
    const [currentItem, setCurrentItem] = useState<unknown | null>(null);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<{
        id: string,
        item: unknown,
        message: string,
    }[]>([]);
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
    return <>
        <h3>Progress</h3>
        <progress value={progress} max={allItems.length}>Processed {progress} of {allItems.length} items.</progress>
        {currentItem ? `Processing ${currentItem}…` : `${progress} / ${allItems.length}`}
        <h3>Errors ({errors.length})</h3>
        {errors.length === 0 ? <p>No errors</p> : (
            <ol>
                {errors.map(error => <li key={error.id}>{`${error.item}`} - {error.message}</li>)}
            </ol>
        )}
    </>;
}
