import { html, useState } from 'htm/preact/standalone.module.js';
import {
    uniqueId,
} from '../helper.js';

export const FloatingLabelInput = ({ label, ...props }) => {
    const [id] = useState(uniqueId);
    return html`
        <div class="floating-label-input">
            <input id=${id} ...${props} placeholder="Text"/>
            <label
                for=${props.id ?? id}
            >${label}${props.required && html`<span class="floating-label-input_required" aria-label="required"> *</span>`}</label>
        </div>
    `;
}

export const HighUpLabelInput = ({ label, ...props }) => {
    const [id] = useState(uniqueId);
    return html`
        <div class="high-up-label-input">
            <input id=${id} ...${props}/>
            <label
                for=${props.id ?? id}
            >${label}${props.required && html`<span class="high-up-label-input_required" aria-label="required"> *</span>`}</label>
        </div>
    `;
}
