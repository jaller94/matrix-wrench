import React, { FC, useState } from 'react';
import {
    uniqueId,
} from '../helper.ts';

type FloatingLabelInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label: string,
};

export const FloatingLabelInput: FC<FloatingLabelInputProps> = ({ label, ...props }) => {
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

type HighUpLabelInputProps = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label: string,
};

export const HighUpLabelInput: FC<HighUpLabelInputProps> = ({ label, ...props }) => {
    const [id] = useState(uniqueId);
    return (
        <div className="high-up-label-input">
            <input id={id} {...props}/>
            <label
                htmlFor={props.id ?? id}
            >{label}{props.required && <span className="high-up-label-input_required" aria-label="required"> *</span>}</label>
        </div>
    );
}
