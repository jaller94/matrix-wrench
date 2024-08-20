import React, { useState } from 'react';
import {
    uniqueId,
} from '../helper.ts';

export const FloatingLabelInput = ({ label, ...props }) => {
    const [id] = useState(uniqueId);
    return (
        <div className="floating-label-input">
            <input id={id} {...props} placeholder="Text"/>
            <label
                htmlFor={props.id ?? id}
            >${label}${props.required && <span className="floating-label-input_required" aria-label="required"> *</span>}</label>
        </div>
    );
}

export const HighUpLabelInput = ({ label, ...props }) => {
    const [id] = useState(uniqueId);
    return (
        <div className="high-up-label-input">
            <input id={id} {...props}/>
            <label
                htmlFor={props.id ?? id}
            >${label}${props.required && <span className="high-up-label-input_required" aria-label="required"> *</span>}</label>
        </div>
    );
}
