var g=function(_,f){for(var c in f)_[c]=f[c];return _},a_=function(_){var f=_.parentNode;f&&f.removeChild(_)},r_=function(_,f,c){var p,l,$,h={};for($ in f)$=="key"?p=f[$]:$=="ref"?l=f[$]:h[$]=f[$];if(arguments.length>2&&(h.children=arguments.length>3?F_.call(arguments,2):c),typeof _=="function"&&_.defaultProps!=null)for($ in _.defaultProps)h[$]===void 0&&(h[$]=_.defaultProps[$]);return p_(_,h,p,l,null)},p_=function(_,f,c,p,l){var $={type:_,props:f,key:c,ref:p,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:l==null?++g_:l};return U.vnode!=null&&U.vnode($),$},x_=function(_){return _.children},$_=function(_,f){this.props=_,this.context=f},r=function(_,f){if(f==null)return _.__?r(_.__,_.__.__k.indexOf(_)+1):null;for(var c;f<_.__k.length;f++)if((c=_.__k[f])!=null&&c.__e!=null)return c.__e;return typeof _.type=="function"?r(_):null},y_=function(_){var f,c;if((_=_.__)!=null&&_.__c!=null){for(_.__e=_.__c.base=null,f=0;f<_.__k.length;f++)if((c=_.__k[f])!=null&&c.__e!=null){_.__e=_.__c.base=c.__e;break}return y_(_)}},J_=function(_){(!_.__d&&(_.__d=!0)&&I.push(_)&&!W_.__r++||u_!==U.debounceRendering)&&((u_=U.debounceRendering)||R_)(W_)},W_=function(){for(var _;W_.__r=I.length;)_=I.sort(function(f,c){return f.__v.__b-c.__v.__b}),I=[],_.some(function(f){var c,p,l,$,h,F;f.__d&&(h=($=(c=f).__v).__e,(F=c.__P)&&(p=[],(l=g({},$)).__v=$.__v+1,X_(F,$,l,c.__n,F.ownerSVGElement!==void 0,$.__h!=null?[h]:null,p,h==null?r($):h,$.__h),i_(p,$),$.__e!=h&&y_($)))})},I_=function(_,f,c,p,l,$,h,F,x,H){var W,Q,Y,V,Z,X,D,G=p&&p.__k||n_,M=G.length;for(c.__k=[],W=0;W<f.length;W++)if((V=c.__k[W]=(V=f[W])==null||typeof V=="boolean"?null:typeof V=="string"||typeof V=="number"||typeof V=="bigint"?p_(null,V,null,null,V):Array.isArray(V)?p_(x_,{children:V},null,null,null):V.__b>0?p_(V.type,V.props,V.key,null,V.__v):V)!=null){if(V.__=c,V.__b=c.__b+1,(Y=G[W])===null||Y&&V.key==Y.key&&V.type===Y.type)G[W]=void 0;else for(Q=0;Q<M;Q++){if((Y=G[Q])&&V.key==Y.key&&V.type===Y.type){G[Q]=void 0;break}Y=null}X_(_,V,Y=Y||h_,l,$,h,F,x,H),Z=V.__e,(Q=V.ref)&&Y.ref!=Q&&(D||(D=[]),Y.ref&&D.push(Y.ref,null,V),D.push(Q,V.__c||Z,V)),Z!=null?(X==null&&(X=Z),typeof V.type=="function"&&V.__k!=null&&V.__k===Y.__k?V.__d=x=o_(V,x,_):x=m_(_,V,Y,G,Z,x),H||c.type!=="option"?typeof c.type=="function"&&(c.__d=x):_.value=""):x&&Y.__e==x&&x.parentNode!=_&&(x=r(Y))}for(c.__e=X,W=M;W--;)G[W]!=null&&(typeof c.type=="function"&&G[W].__e!=null&&G[W].__e==c.__d&&(c.__d=r(p,W+1)),d_(G[W],G[W]));if(D)for(W=0;W<D.length;W++)s_(D[W],D[++W],D[++W])},o_=function(_,f,c){var p,l;for(p=0;p<_.__k.length;p++)(l=_.__k[p])&&(l.__=_,f=typeof l.type=="function"?o_(l,f,c):m_(c,l,l,_.__k,l.__e,f));return f},m_=function(_,f,c,p,l,$){var h,F,x;if(f.__d!==void 0)h=f.__d,f.__d=void 0;else if(c==null||l!=$||l.parentNode==null)_:if($==null||$.parentNode!==_)_.appendChild(l),h=null;else{for(F=$,x=0;(F=F.nextSibling)&&x<p.length;x+=2)if(F==l)break _;_.insertBefore(l,$),h=$}return h!==void 0?h:l.nextSibling},j_=function(_,f,c){f[0]==="-"?_.setProperty(f,c):_[f]=c==null?"":typeof c!="number"||Rf.test(f)?c:c+"px"},c_=function(_,f,c,p,l){var $;_:if(f==="style")if(typeof c=="string")_.style.cssText=c;else{if(typeof p=="string"&&(_.style.cssText=p=""),p)for(f in p)c&&f in c||j_(_.style,f,"");if(c)for(f in c)p&&c[f]===p[f]||j_(_.style,f,c[f])}else if(f[0]==="o"&&f[1]==="n")$=f!==(f=f.replace(/Capture$/,"")),f=f.toLowerCase()in _?f.toLowerCase().slice(2):f.slice(2),_.l||(_.l={}),_.l[f+$]=c,c?p||_.addEventListener(f,$?M_:P_,$):_.removeEventListener(f,$?M_:P_,$);else if(f!=="dangerouslySetInnerHTML"){if(l)f=f.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if(f!=="href"&&f!=="list"&&f!=="form"&&f!=="tabIndex"&&f!=="download"&&f in _)try{_[f]=c==null?"":c;break _}catch(h){}typeof c=="function"||(c!=null&&(c!==!1||f[0]==="a"&&f[1]==="r")?_.setAttribute(f,c):_.removeAttribute(f))}},P_=function(_){this.l[_.type+!1](U.event?U.event(_):_)},M_=function(_){this.l[_.type+!0](U.event?U.event(_):_)},X_=function(_,f,c,p,l,$,h,F,x){var H,W,Q,Y,V,Z,X,D,G,M,B,k=f.type;if(f.constructor!==void 0)return null;c.__h!=null&&(x=c.__h,F=f.__e=c.__e,f.__h=null,$=[F]),(H=U.__b)&&H(f);try{_:if(typeof k=="function"){if(D=f.props,G=(H=k.contextType)&&p[H.__c],M=H?G?G.props.value:H.__:p,c.__c?X=(W=f.__c=c.__c).__=W.__E:(("prototype"in k)&&k.prototype.render?f.__c=W=new k(D,M):(f.__c=W=new $_(D,M),W.constructor=k,W.render=nf),G&&G.sub(W),W.props=D,W.state||(W.state={}),W.context=M,W.__n=p,Q=W.__d=!0,W.__h=[]),W.__s==null&&(W.__s=W.state),k.getDerivedStateFromProps!=null&&(W.__s==W.state&&(W.__s=g({},W.__s)),g(W.__s,k.getDerivedStateFromProps(D,W.__s))),Y=W.props,V=W.state,Q)k.getDerivedStateFromProps==null&&W.componentWillMount!=null&&W.componentWillMount(),W.componentDidMount!=null&&W.__h.push(W.componentDidMount);else{if(k.getDerivedStateFromProps==null&&D!==Y&&W.componentWillReceiveProps!=null&&W.componentWillReceiveProps(D,M),!W.__e&&W.shouldComponentUpdate!=null&&W.shouldComponentUpdate(D,W.__s,M)===!1||f.__v===c.__v){W.props=D,W.state=W.__s,f.__v!==c.__v&&(W.__d=!1),W.__v=f,f.__e=c.__e,f.__k=c.__k,f.__k.forEach(function(K){K&&(K.__=f)}),W.__h.length&&h.push(W);break _}W.componentWillUpdate!=null&&W.componentWillUpdate(D,W.__s,M),W.componentDidUpdate!=null&&W.__h.push(function(){W.componentDidUpdate(Y,V,Z)})}W.context=M,W.props=D,W.state=W.__s,(H=U.__r)&&H(f),W.__d=!1,W.__v=f,W.__P=_,H=W.render(W.props,W.state,W.context),W.state=W.__s,W.getChildContext!=null&&(p=g(g({},p),W.getChildContext())),Q||W.getSnapshotBeforeUpdate==null||(Z=W.getSnapshotBeforeUpdate(Y,V)),B=H!=null&&H.type===x_&&H.key==null?H.props.children:H,I_(_,Array.isArray(B)?B:[B],f,c,p,l,$,h,F,x),W.base=f.__e,f.__h=null,W.__h.length&&h.push(W),X&&(W.__E=W.__=null),W.__e=!1}else $==null&&f.__v===c.__v?(f.__k=c.__k,f.__e=c.__e):f.__e=Sf(c.__e,f,c,p,l,$,h,x);(H=U.diffed)&&H(f)}catch(K){f.__v=null,(x||$!=null)&&(f.__e=F,f.__h=!!x,$[$.indexOf(F)]=null),U.__e(K,f,c)}},i_=function(_,f){U.__c&&U.__c(f,_),_.some(function(c){try{_=c.__h,c.__h=[],_.some(function(p){p.call(c)})}catch(p){U.__e(p,c.__v)}})},Sf=function(_,f,c,p,l,$,h,F){var x,H,W,Q=c.props,Y=f.props,V=f.type,Z=0;if(V==="svg"&&(l=!0),$!=null){for(;Z<$.length;Z++)if((x=$[Z])&&(x===_||(V?x.localName==V:x.nodeType==3))){_=x,$[Z]=null;break}}if(_==null){if(V===null)return document.createTextNode(Y);_=l?document.createElementNS("http://www.w3.org/2000/svg",V):document.createElement(V,Y.is&&Y),$=null,F=!1}if(V===null)Q===Y||F&&_.data===Y||(_.data=Y);else{if($=$&&F_.call(_.childNodes),H=(Q=c.props||h_).dangerouslySetInnerHTML,W=Y.dangerouslySetInnerHTML,!F){if($!=null)for(Q={},Z=0;Z<_.attributes.length;Z++)Q[_.attributes[Z].name]=_.attributes[Z].value;(W||H)&&(W&&(H&&W.__html==H.__html||W.__html===_.innerHTML)||(_.innerHTML=W&&W.__html||""))}if(function(X,D,G,M,B){var k;for(k in G)k==="children"||k==="key"||k in D||c_(X,k,null,G[k],M);for(k in D)B&&typeof D[k]!="function"||k==="children"||k==="key"||k==="value"||k==="checked"||G[k]===D[k]||c_(X,k,D[k],G[k],M)}(_,Y,Q,l,F),W)f.__k=[];else if(Z=f.props.children,I_(_,Array.isArray(Z)?Z:[Z],f,c,p,l&&V!=="foreignObject",$,h,$?$[0]:c.__k&&r(c,0),F),$!=null)for(Z=$.length;Z--;)$[Z]!=null&&a_($[Z]);F||(("value"in Y)&&(Z=Y.value)!==void 0&&(Z!==_.value||V==="progress"&&!Z)&&c_(_,"value",Z,Q.value,!1),("checked"in Y)&&(Z=Y.checked)!==void 0&&Z!==_.checked&&c_(_,"checked",Z,Q.checked,!1))}return _},s_=function(_,f,c){try{typeof _=="function"?_(f):_.current=f}catch(p){U.__e(p,c)}},d_=function(_,f,c){var p,l;if(U.unmount&&U.unmount(_),(p=_.ref)&&(p.current&&p.current!==_.__e||s_(p,null,f)),(p=_.__c)!=null){if(p.componentWillUnmount)try{p.componentWillUnmount()}catch($){U.__e($,f)}p.base=p.__P=null}if(p=_.__k)for(l=0;l<p.length;l++)p[l]&&d_(p[l],f,typeof _.type!="function");c||_.__e==null||a_(_.__e),_.__e=_.__d=void 0},nf=function(_,f,c){return this.constructor(_,c)},t_=function(_,f,c){var p,l,$;U.__&&U.__(_,f),l=(p=typeof c=="function")?null:c&&c.__k||f.__k,$=[],X_(f,_=(!p&&c||f).__k=r_(x_,null,[_]),l||h_,h_,f.ownerSVGElement!==void 0,!p&&c?[c]:l?null:f.firstChild?F_.call(f.childNodes):null,$,!p&&c?c:l?l.__e:f.firstChild,p),i_($,_)},G_=function(_,f){var c={__c:f="__cC"+S_++,__:_,Consumer:function(p,l){return p.children(l)},Provider:function(p){var l,$;return this.getChildContext||(l=[],($={})[f]=this,this.getChildContext=function(){return $},this.shouldComponentUpdate=function(h){this.props.value!==h.value&&l.some(J_)},this.sub=function(h){l.push(h);var F=h.componentWillUnmount;h.componentWillUnmount=function(){l.splice(l.indexOf(h),1),F&&F.call(h)}}),p.children}};return c.Provider.__=c.Consumer.contextType=c},O_=function(_,f){U.__h&&U.__h(A,_,o||f),o=0;var c=A.__H||(A.__H={__:[],__h:[]});return _>=c.__.length&&c.__.push({}),c.__[_]},z=function(_){return o=1,af(ff,_)},af=function(_,f,c){var p=O_(m++,2);return p.t=_,p.__c||(p.__=[c?c(f):ff(void 0,f),function(l){var $=p.t(p.__[0],l);p.__[0]!==$&&(p.__=[$,p.__[1]],p.__c.setState({}))}],p.__c=A),p.__},C=function(_,f){var c=O_(m++,3);!U.__s&&_f(c.__H,f)&&(c.__=_,c.__H=f,A.__H.__h.push(c))};var e_=function(_){return o=5,N(function(){return{current:_}},[])};var N=function(_,f){var c=O_(m++,7);return _f(c.__H,f)&&(c.__=_(),c.__H=f,c.__h=_),c.__},J=function(_,f){return o=8,N(function(){return _},f)},b=function(_){var f=A.context[_.__c],c=O_(m++,9);return c.c=_,f?(c.__==null&&(c.__=!0,f.sub(A)),f.props.value):_.__};var rf=function(){Z_.forEach(function(_){if(_.__P)try{_.__H.__h.forEach(l_),_.__H.__h.forEach(Q_),_.__H.__h=[]}catch(f){_.__H.__h=[],U.__e(f,_.__v)}}),Z_=[]},l_=function(_){var f=A;typeof _.__c=="function"&&_.__c(),A=f},Q_=function(_){var f=A;_.__c=_.__(),A=f},_f=function(_,f){return!_||_.length!==f.length||f.some(function(c,p){return c!==_[p]})},ff=function(_,f){return typeof f=="function"?f(_):f},F_,U,g_,I,R_,u_,S_,h_={},n_=[],Rf=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;F_=n_.slice,U={__e:function(_,f){for(var c,p,l;f=f.__;)if((c=f.__c)&&!c.__)try{if((p=c.constructor)&&p.getDerivedStateFromError!=null&&(c.setState(p.getDerivedStateFromError(_)),l=c.__d),c.componentDidCatch!=null&&(c.componentDidCatch(_),l=c.__d),l)return c.__E=c}catch($){_=$}throw _}},g_=0,$_.prototype.setState=function(_,f){var c;c=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=g({},this.state),typeof _=="function"&&(_=_(g({},c),this.props)),_&&g(c,_),_!=null&&this.__v&&(f&&this.__h.push(f),J_(this))},$_.prototype.forceUpdate=function(_){this.__v&&(this.__e=!0,_&&this.__h.push(_),J_(this))},$_.prototype.render=x_,I=[],R_=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,W_.__r=0,S_=0;var m,A,A_,o=0,Z_=[],C_=U.__b,L_=U.__r,B_=U.diffed,b_=U.__c,E_=U.unmount;U.__b=function(_){A=null,C_&&C_(_)},U.__r=function(_){L_&&L_(_),m=0;var f=(A=_.__c).__H;f&&(f.__h.forEach(l_),f.__h.forEach(Q_),f.__h=[])},U.diffed=function(_){B_&&B_(_);var f=_.__c;f&&f.__H&&f.__H.__h.length&&(Z_.push(f)!==1&&A_===U.requestAnimationFrame||((A_=U.requestAnimationFrame)||function(c){var p,l=function(){clearTimeout($),q_&&cancelAnimationFrame(p),setTimeout(c)},$=setTimeout(l,100);q_&&(p=requestAnimationFrame(l))})(rf)),A=void 0},U.__c=function(_,f){f.some(function(c){try{c.__h.forEach(l_),c.__h=c.__h.filter(function(p){return!p.__||Q_(p)})}catch(p){f.some(function(l){l.__h&&(l.__h=[])}),f=[],U.__e(p,c.__v)}}),b_&&b_(_,f)},U.unmount=function(_){E_&&E_(_);var f=_.__c;if(f&&f.__H)try{f.__H.__.forEach(l_)}catch(c){U.__e(c,f.__v)}};var q_=typeof requestAnimationFrame=="function",cf=function(_,f,c,p){var l;f[0]=0;for(var $=1;$<f.length;$++){var h=f[$++],F=f[$]?(f[0]|=h?1:2,c[f[$++]]):f[++$];h===3?p[0]=F:h===4?p[1]=Object.assign(p[1]||{},F):h===5?(p[1]=p[1]||{})[f[++$]]=F:h===6?p[1][f[++$]]+=F+"":h?(l=_.apply(F,cf(_,F,c,["",null])),p.push(l),F[0]?f[0]|=2:(f[$-2]=0,f[$]=l)):p.push(F)}return p},v_=new Map,O=function(_){var f=v_.get(this);return f||(f=new Map,v_.set(this,f)),(f=cf(this,f.get(_)||(f.set(_,f=function(c){for(var p,l,$=1,h="",F="",x=[0],H=function(Y){$===1&&(Y||(h=h.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?x.push(0,Y,h):$===3&&(Y||h)?(x.push(3,Y,h),$=2):$===2&&h==="..."&&Y?x.push(4,Y,0):$===2&&h&&!Y?x.push(5,0,!0,h):$>=5&&((h||!Y&&$===5)&&(x.push($,0,h,l),$=6),Y&&(x.push($,Y,0,l),$=6)),h=""},W=0;W<c.length;W++){W&&($===1&&H(),H(W));for(var Q=0;Q<c[W].length;Q++)p=c[W][Q],$===1?p==="<"?(H(),x=[x],$=3):h+=p:$===4?h==="--"&&p===">"?($=1,h=""):h=p+h[0]:F?p===F?F="":h+=p:p==='"'||p==="'"?F=p:p===">"?(H(),$=1):$&&(p==="="?($=5,l=h,h=""):p==="/"&&($<5||c[W][Q+1]===">")?(H(),$===3&&(x=x[0]),$=x,(x=x[0]).push(2,0,$),$=0):p===" "||p==="\t"||p==="\n"||p==="\r"?(H(),$=2):h+=p),$===3&&h==="!--"&&($=4,x=x[0])}return H(),x}(_)),f),arguments,[])).length>1?f:f[0]}.bind(r_);function $f(..._){const f=new Set;for(let c of _){if(typeof c==="string")f.add(c);if(typeof c==="object")Object.entries(c).forEach(([p,l])=>{if(l)f.add(p)})}return[...f].join(" ")}function U_(_,f){let c=_,p;while(p=c.match(yf))c=c.slice(0,p.index)+encodeURIComponent(f[p.groups.key])+c.slice(p.index+p[0].length);return c}function y(_="id-"){return pf+=1,`${_}${pf}`}var yf=/!{(?<key>.+?)}/,pf=0;function If({open:_,title:f,onClose:c}){const p=e_();return C(()=>{if(_)p.current?.showModal(),document.body.classList.add("modal-open");else p.current?.close(),document.body.classList.remove("modal-open")},[_]),O`
        <dialog
            class="modal_frame"
            ref=${p}
            onClose=${J(()=>c(!1),[c])}
        >
            <p class="modal_title">${f}</p>
            <div class="modal_buttons">
                <button type="button" onClick=${J(()=>c(!1),[c])}>Cancel</button>
                <button
                    autofocus
                    class="primary"
                    type="button"
                    onClick=${J(()=>c(!0),[c])}
                >OK</button>
            </div>
        </dialog>
    `}function lf(){const[_,f]=z(!1),[c,p]=z("");return C(()=>{const $=(h)=>{p(h.detail.title),f(!0)};return window.addEventListener("confirm",$),()=>{window.removeEventListener("confirm",$)}},[]),O`
        <${If}
            open=${_}
            title=${c}
            onClose=${($)=>{f(!1),window.dispatchEvent(new CustomEvent("confirmed",{detail:{response:$}}))}}
        />
    `}var E=(_)=>new Promise((f)=>{window.dispatchEvent(new CustomEvent("confirm",{detail:{title:_}}));const c=async(p)=>{f(p.detail.response)};window.addEventListener("confirmed",c)});function i({actionLabel:_,onSubmit:f}){const[c,p]=z(""),l=J(async($)=>{$.preventDefault(),$.stopPropagation();let h=c.split(/[\s,;]/);h=h.map((x)=>x.trim());const F=/^@.*:/;h=h.filter((x)=>F.test(x)),await f({userIds:h})},[c,f]);return O`
        <form onsubmit=${l}>
            <label>
                User IDs (separated by spaces, new lines, commas or semi-colons)
                <textarea
                    value=${c}
                    oninput=${J(({target:$})=>p($.value),[])}
                />
            </label>
            <button class="primary">${_}</button>
        </form>
    `}function s({action:_,items:f}){const[c,p]=z(null),[l,$]=z(0),[h,F]=z([]),[x,H]=z(f);return C(()=>{if(x.length!==0)return;H(f)},[x,f]),C(()=>{async function W(){for(let Q of x){try{p(Q),await _(Q)}catch(Y){F((V)=>[...V,{id:y(),item:Q,message:Y.content?.errcode||Y.message}])}$((Y)=>Y+1)}p(null)}W()},[_,x]),O`
        <h3>Progress</h3>
        <progress value=${l} max=${x.length}>Processed ${l} of ${x.length} items.</progress>
        ${c?O`
            Processing ${c}…
        `:O`
            ${l} / ${x.length}
        `}
        <h3>Errors (${h.length})</h3>
        ${h.length===0?O`<p>No errors</p>`:O`
            <ol>
                ${h.map((W)=>O`<li key=${W.id}>${`${W.item}`} - ${W.message}</li>`)}
            </ol>
        `}
    `}async function w(_,f){const c=hf;hf+=1,window.dispatchEvent(new CustomEvent("matrix-request",{detail:{init:f,resource:_,requestId:c}}));let p,l,$=!1;try{p=await fetch(_,f)}catch(h){throw window.dispatchEvent(new CustomEvent("matrix-response",{detail:{requestId:c}})),h}try{l=await p.json()}catch(h){$=!0}if(window.dispatchEvent(new CustomEvent("matrix-response",{detail:{isNotJson:$,requestId:c,status:p.status,errcode:l?.errcode,error:l?.error}})),$)throw new Error(`Didn't receive valid JSON: ${_}`);if(!p.ok)throw new d(l);return l}function H_(_){return _.replace(/\\/g,"\\\\").replace(/'/g,"\\\'")}function Wf(_,f={},c=!1){let p="curl ";if(f.method!==void 0&&f.method!=="GET")p+=`-X ${f.method} `;if(f.body)p+=`--data '${H_(f.body)}' `;for(let[l,$]of Object.entries(f.headers??{})){if(c&&l.toLocaleLowerCase()==="authorization")$="Bearer your_access_token";p+=`-H '${H_(l)}: ${H_($)}' `}return p+=`'${H_(_)}'`,p}function Ff(_,f){const c=_.match(of);let p=_;if(c&&c.groups.command)p=c.groups.command;return`${f.method} ${p}`}function u(_,f,c={}){const p=new URL(f);if(_.masqueradeAs)p.searchParams.set("user_id",_.masqueradeAs);return[p.toString(),{...c,headers:{...c?.headers,..._.accessToken&&{Authorization:`Bearer ${_.accessToken}`}}}]}async function xf(_,f,c,p){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/ban`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:c,reason:p})}))}async function t(_,f){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/createRoom`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)}))}async function Of(_,f,c){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(f)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({room_id:c})}))}async function Hf(_,f){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(f)}`,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomAlias:f})}))}async function Y_(_,f,c){const p=f??(await S(_)).user_id;return w(...u(_,`${_.serverAddress}/_matrix/client/v3/user/${encodeURIComponent(p)}/account_data/${encodeURIComponent(c)}`,{method:"GET"}))}async function k_(_,f,c){let p=`${_.serverAddress}/_matrix/client/v1/rooms/${encodeURIComponent(f)}/hierarchy`;if(c)p+=`?from=${encodeURIComponent(c)}`;return w(...u(_,p,{method:"GET"}))}async function V_(_,f){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/joined_members`,{method:"GET"}))}async function R(_){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/joined_rooms`,{method:"GET"}))}async function Yf(_,f){return w(...u(_,`${_.serverAddress}/_synapse/admin/v1/room/${encodeURIComponent(f)}/media`,{method:"GET"}))}async function K_(_,f){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/members`,{method:"GET"}))}async function L(_,f,c,p){let l=`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/state`;if(c)l+=`/${encodeURIComponent(c)}`;if(p)l+=`/${encodeURIComponent(p)}`;return w(...u(_,l,{method:"GET"}))}async function z_(_,f,c){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/invite`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:c})}))}async function Vf(_,f){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/join`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({roomId:f})}))}async function N_(_,f,c,p){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/kick`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:c,reason:p})}))}async function e(_,f){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/directory/room/${encodeURIComponent(f)}`,{method:"GET"}))}async function zf(_,f,c,p,l){const $=`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/send/`+`${encodeURIComponent(c)}/${encodeURIComponent(l??Math.random())}`;return w(...u(_,$,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)}))}async function T_(_,f,c,p,l){let $=`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/state/${encodeURIComponent(c)}`;if(p)$+=`/${encodeURIComponent(p)}`;return w(...u(_,$,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)}))}async function Df(_,f,c){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/rooms/${encodeURIComponent(f)}/unban`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user_id:c})}))}async function S(_){return w(...u(_,`${_.serverAddress}/_matrix/client/v3/account/whoami`,{method:"GET"}))}async function*Jf(_,f){let c=[],p;do{const l=await k_(_,f,p);c=[...c,...l.rooms],yield{rooms:c},p=l.next_batch}while(p)}class d extends Error{constructor(_){super(_.error);this.errcode=_.errcode,this.content=_}}var hf=1,of=/\/_matrix\/client\/.+?\/(?<command>.*)$/;function n({body:_,identity:f,label:c,method:p,requiresConfirmation:l,url:$,variables:h}){const F=J(async(x)=>{if(x.preventDefault(),x.stopPropagation(),l){if(!await E("This is a high-risk action!\nAre you sure?"))return}let H=`${f.serverAddress}${U_($,h)}`;try{await w(...u(f,H,{method:p,headers:{"Content-Type":typeof _==="string"?"text/plain":"application/json"},..._&&{body:typeof _==="string"?_:JSON.stringify(_)}}))}catch(W){alert(W)}},[_,f,p,l,$,h]);return O`
        <button type="button" onclick=${F}>${c}</button>
    `}function __({body:_,children:f,identity:c,method:p,requiresConfirmation:l,url:$,variables:h,...F}){const x=J(async(H)=>{if(H.preventDefault(),H.stopPropagation(),l){if(!await E("This is a high-risk action!\nAre you sure?"))return}let W=`${c.serverAddress}${U_($,h)}`;try{await w(...u(c,W,{method:p,..._&&{body:typeof _==="string"?_:JSON.stringify(_)}}))}catch(Q){alert(Q)}},[_,c,p,l,$,h]);return O`
        <form onsubmit=${x} ...${F}>${f}</form>
    `}function T({backLabel:_="Back",backUrl:f,children:c,onBack:p}){const l=J(($)=>{if(f)$.preventDefault(),$.stopPropagation(),window.location=f;if(p)p($)},[f,p]);return O`
        <header class="app-header">
            ${(p||typeof f==="string")&&O`<button aria-label=${_} class="app-header_back" title=${_} type="button" onclick=${l}>${"<"}</button>`}
            <h1 class="app-header_label">${c}</h1>
            <nav class="app-header_nav">
                <a href="#about">About</a>
            </nav>
        </header>
    `}var j=({label:_,...f})=>{const[c]=z(y);return O`
        <div class="high-up-label-input">
            <input id=${c} ...${f}/>
            <label
                for=${f.id??c}
            >${_}${f.required&&O`<span class="high-up-label-input_required" aria-label="required"> *</span>`}</label>
        </div>
    `};function q({identity:_,roomId:f}){return O`<a href=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}`}>${f}</a>`}var a=function(_){return O`<a ...${_}/>`};function w_(){return O`
        <${T} backUrl="#">About</>
        <h2>What is Matrix Wrench?</h2>
        <p>
            Matrix Wrench is a fast, convenient way to manage Matrix rooms. It's a user interface for tasks where one would have used the terminal application CURL.
        </p>
        <p>
            A common task is to view and edit a room state, e.g. to change the power levels. It works with access tokens of regular users and appservices (bridges and complex bots). If you give it an appservice token you can access any room the appservice has access to, allowing to easily debug and administrate bridges.
        </p>
        <p>
            Furthermore, a few tasks around homeserver administration are supported, like listing media files in unencrypted rooms. The majority of features use the standardized <${a} href="https://spec.matrix.org/">Matrix protocol</a>. If a feature makes use of the Synapse Admin API, this is noted.
        </p>
        <h2>Common tasks</h2>
        <h2>Identities</h2>
        <p>
            You can manage multiple logins to various homeservers. An identity is a combination of a homeserver URL and an access token. The identity name is only used for identification within Matrix Wrench.
        </p>
        <h2>Privacy and Security</h2>
        <p>
            No information about your homeserver or actions is sent to the developer or host of this web application. Identities are optionally stored in your browser's <${a} href="https://developer.mozilla.org//docs/Web/API/Window/localStorage">localStorage</a>. To eliminate the risk of a malicious release which could compromise your Matrix access tokens, download the application's source code and host it on a static HTTP(S) server.
        </p>
        <p>
            Matrix Wrench is my hobby project without a security audit or peer review. I use it at work and try to apply some best practices from my professional work to the development, however, Matrix Wrench is neither backed nor endorsed by my employer. There are a few unit tests that are automatically run on every commit. The project's dependencies are currently limited to <${a} href="https://www.npmjs.com/package/htm">htm</a> for rendering the interface.
        </p>
        <h2>Development</h2>
        <p>Found a bug? Want a feature? Please use the <${a} href="https://gitlab.com/jaller94/matrix-wrench/-/issues">issue tracker on Gitlab.com</a>.</p>
        <ul>
            <li>Code: <${a} href="https://gitlab.com/jaller94/matrix-wrench">Matrix Wrench on Gitlab.com</a></li>
            <li>License: <${a} href="https://choosealicense.com/licenses/apache-2.0/">Apache 2.0</a></li>
            <li>Author: <${a} href="https://chrpaul.de/about">Christian Paul</a></li>
        </ul>
    `}function mf(_){if(_==="ascending")return" \uD83D\uDD3C";else if(_==="descending")return" \uD83D\uDD3D";return""}var sf=function(_,f){if(_.endsWith(".length"))return f[_.slice(0,-7)]?.length;else if(_.endsWith("[,]"))return[...f[_.slice(0,-3)]??[]].join(", ");return f[_]};function df({propertyName:_,label:f,sortBys:c,onSortBys:p}){const l=J(()=>{const h=c.find(([F])=>F===_)?.[1]==="ascending"?"descending":"ascending";return p([[_,h]])},[_,c,p]);return O`<th onclick=${l}>${f}${mf(c.find(([$])=>$===_)?.[1])}</th>`}function tf({columns:_,data:f,primaryAccessor:c,sortBys:p,onSortBys:l}){return O`
        <div class="room-list">
            <table>
                <thead>
                    <tr>
                        ${_.map(($)=>O`
                            <${df} key=${$.accessor} propertyName=${$.accessor} label=${$.Header} sortBys=${p} onSortBys=${l} />
                        `)}
                    </tr>
                </thead>
                <tbody>
                    ${f.map(($)=>O`
                        <tr key=${$[c]}>
                            ${_.map((h)=>O`
                                <td key=${h.accessor}>${sf(h.accessor,$)}</td>
                            `)}
                        </tr>
                    `)}
                </tbody>
            </table>
        </div>
    `}function ef({data:_,...f}){const[c,p]=z([]),l=N(()=>{let $=[..._];for(let[h,F]of c){const x=F==="ascending"?1:-1;if(h.endsWith("Count")||h.endsWith("PowerLevel"))$.sort((H,W)=>x*((H[h]??0)-(W[h]??0)));else if(h.endsWith(".length")){const H=h.slice(0,-7);$.sort((W,Q)=>x*((W[H]?.length??0)-(Q[H]?.length??0)))}else $.sort((H,W)=>x*(H[h]??"").localeCompare(W[h]??""))}return $},[_,c]);return O`<${tf}
        ...${f}
        data=${l}
        sortBys=${c}
        onSortBys=${p}
    />`}function D_({data:_,...f}){const[c,p]=z([]),l=N(()=>{return _.filter(($)=>c.every((h)=>$[h[0]].includes(h[1])))},[_,c]);return O`<${ef}
        ...${f}
        data=${l}
        onFilters=${p}
    />`}async function*_c(_){const f=await Y_(_,null,"m.direct");let p=Object.keys(f).map((h)=>({userId:h}));yield{rows:p};const l=(await R(_)).joined_rooms;let $=0;for(let h of l){try{const F=new Map(Object.entries((await V_(_,h)).joined));p=p.map((x)=>{const H=F.get(x.userId);if(!H)return x;return{...x,sharedRooms:(x.sharedRooms??new Set).add(h),sharedRoomsCount:(x.sharedRoomsCount??0)+1,names:(x.names??new Set).add(H.display_name)}})}catch(F){console.error(F)}$+=1,yield{progressValue:$,progressMax:l.length,rows:p}}}function Zf({identity:_}){const[f,c]=z(!1),[p,l]=z([]),[$,h]=z(void 0),[F,x]=z(void 0),[H,W]=z(""),Q=J(async(V)=>{V.preventDefault(),V.stopPropagation(),c(!0),l([]),W("");try{for await(let Z of _c(_))h(Z.progressValue),x(Z.progressMax),l(Z.rows),W(JSON.stringify(Z.rows,null,2))}catch(Z){W(Z)}finally{c(!1),h(void 0),x(void 0)}},[_]),Y=N(()=>[{Header:"User ID",accessor:"userId"},{Header:"Shared rooms",accessor:"sharedRoomsCount"},{Header:"Names",accessor:"names[,]"}],[]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}`}
        >Contact List</>
        <main>
            <button
                disabled=${f}
                type="button"
                onclick=${Q}
            >Start fetching</button>
            ${f&&O`<progress value=${$} max=${F}/>`}
            <${D_} columns=${Y} data=${p} primaryAccessor="userId" />
            <textarea readonly value=${H} />
        </main>
        <${P} />
    `}var fc=function({identity:_,roomId:f,onChange:c}){const[p,l]=z(f??""),[$,h]=z(!1);C(()=>{let x=p.split(/[\s,;]/);x=x.map((W)=>W.trim());const H=/^!.+/;x=x.filter((W)=>H.test(W)),c(x)},[p,c]);const F=J(async()=>{h(!0);try{let{rooms:x}=await k_(_,f);x=x.filter((H)=>H.room_id!==f),l((H)=>`${H}\n${x.map((W)=>W.room_id).join("\n")}`)}finally{h(!1)}},[_,f]);return O`
        <label>
            Room IDs (separated by spaces, new lines, commas or semi-colons)
            <textarea
                value=${p}
                oninput=${J(({target:x})=>l(x.value),[])}
            />
        </label>
        <button
            disabled=${$}
            type="button"
            onclick=${F}
        >Query child Spaces</button>
    `};function Qf({identity:_,roomId:f}){const[c,p]=z([]),[l,$]=z([]),h=J(({userIds:H})=>{$(H)},[]),F=N(()=>{const H=[];for(let W of l){const Q={..._,masqueradeAs:W};for(let Y of c)H.push({masqueradedIdentity:Q,roomId:Y})}return H},[_,c,l]),x=J(async({masqueradedIdentity:H,roomId:W})=>{return Vf(H,W)},[]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}`}
        >Mass Joiner</>
        <main>
            <p>This <em>experimental</em> page requires an AppService token. On behalf of each user, it will join each room.</p>
            <${fc} identity=${_} roomId=${f} onChange=${p} />
            <${i} actionLabel="Make users join" onSubmit=${h} />
            <${s} action=${x} items=${F} />
        </main>
        <${P} />
    `}function Xf({identity:_}){const[f,c]=z(!1),[p,l]=z(),[$,h]=z(),[F,x]=z(),H=J(async(W)=>{W.preventDefault(),W.stopPropagation(),c(!0),h([]),x([]);try{const Q=(await R(_)).joined_rooms;console.log(Q);for(let Y of Q){const V=await L(_,Y),Z=V.find((D)=>D.type===cc.room&&D.state_key==="")?.content,X=V.find((D)=>D.type==="m.room.tombstone"&&D.state_key==="")?.content;if(!Z||X.replacement_room)continue;if(Z.type==="main"){const D=V.find((G)=>G.type==="m.room.name"&&G.state_key==="")?.content?.name;h((G)=>[...G,{mainRoomId:Y,name:D,subRooms:[]}])}else if(Z.type==="sub"){const D=V.find((G)=>G.type==="m.room.name"&&G.state_key==="")?.content?.name;x((G)=>[...G,{roomId:Y,name:D,subRooms:[]}])}}}catch(Q){console.error(Q),l(Q.message)}finally{c(!1)}},[_]);return O`
        <div class="card">
            <h2>Load existing rooms (Work in progress)</h2>
            <div>
                <button
                    disabled=${f}
                    type="button"
                    onclick=${H}
                >Load existing rooms</button>
            </div>
            ${Array.isArray($)&&O`
                <h3>Main Rooms</h3>
                <ul>
                    ${$.map((W)=>O`
                        <li key=${W.mainRoomId}>
                            ${W.name}
                            <${q} identity=${_} roomId=${W.mainRoomId}/>
                        </li>
                    `)}
                </ul>
            `}
            ${Array.isArray(F)&&O`
                <h3>Unclaimed Sub Rooms</h3>
                <ul>
                    ${F.map((W)=>O`
                        <li key=${W.roomId}>
                            ${W.name}
                            <${q} identity=${_} roomId=${W.roomId}/>
                        </li>
                    `)}
                </ul>
            `}
        </div>
    `}var cc={room:"de.polychat.room",participant:"de.polychat.room.participant"};function Uf({identity:_}){const{externalMatrixUrl:f}=b(v),[c,p]=z(!1),[l,$]=z(""),[h,F]=z(""),[x,H]=z(""),[W,Q]=z(null),Y=J(async(X)=>{X.preventDefault(),X.stopPropagation(),p(!0),$("");try{const D=await t(_,{name:"Main room",initial_state:[{type:Gf.room,content:{type:"main",network:x}}]});$(D.room_id)}catch(D){Q(D.message)}finally{p(!1)}},[_,x]),V=J(async(X)=>{X.preventDefault(),X.stopPropagation(),p(!0),F("");try{const D=await t(_,{name:"Sub room",initial_state:[{type:Gf.room,content:{type:"sub",network:x}}]});F(D.room_id)}catch(D){Q(D.message)}finally{p(!1)}},[_,x]),Z=J(async(X)=>{H(X.target.value)},[]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}`}
        >Polychat</>
        <main>
            <div class="card">
                <fieldset disabled=${c}>
                    <h2>Create main room</h2>
                    <div>
                        <button
                            disabled=${c}
                            type="button"
                            onclick=${Y}
                        >Create Main Room</button>
                    </div>
                    ${l&&O`
                        <div>
                            <${q} identity=${_} roomId=${l} />
                            <a
                                href=${`${f}${encodeURIComponent(l)}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                title="Open room externally"
                            >
                                <img alt="" src="./assets/external-link.svg" />
                            </a>
                        </div>
                    `}
                    <hr/>
                    <h2>Create unclaimed sub room</h2>
                    <div>
                        <${j}
                            label="Network (signal, telegram, whatsapp)"
                            value=${x}
                            onChange=${Z}
                        />
                    </div>
                    <div>
                        <button
                            type="button"
                            onclick=${V}
                        >Create unclaimed Sub Room</button>
                    </div>
                    ${h&&O`
                        <div>
                            <${q} identity=${_} roomId=${h} />
                            <a
                                href=${`${f}${encodeURIComponent(h)}`}
                                rel="noopener noreferrer"
                                target="_blank"
                                title="Open room externally"
                            >
                                <img alt="" src="./assets/external-link.svg" />
                            </a>
                        </div>
                    `}
                </fieldset>
                ${W&&O`
                    <p>Error: ${W}</p>
                `}
            </div>
            <${Xf} identity=${_} />
        </main>
        <${P} />
    `}var Gf={room:"de.polychat.room",participant:"de.polychat.room.participant"};function kf({identity:_}){const f=N(()=>[{url:`#/${encodeURIComponent(_.name)}/room-list`,name:"Your rooms"},{url:`#/${encodeURIComponent(_.name)}/contact-list`,name:"Your contacts"},{url:`#/${encodeURIComponent(_.name)}/polychat`,name:"Polychat"}],[_]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}`}
        >Overview</>
        <main>
            <ul>
                ${f.map((c)=>O`
                    <li key=${c.url}>
                        <a href=${c.url}>${c.name}</a>
                    </li>
                `)}
            </ul>
        </main>
    `}async function Kf(_,f){const c={room_id:f};try{const p=await L(_,f),l=p.find((Y)=>Y.type==="m.room.create"&&Y.state_key==="")?.content;if(typeof l?.type==="string")c.type=l?.type;if(typeof l?.room_version==="string")c.roomVersion=l?.room_version??"1";const $=p.find((Y)=>Y.type==="m.room.canonical_alias"&&Y.state_key==="")?.content?.alias;if(typeof $==="string")c.canonicalAlias=$;const h=p.find((Y)=>Y.type==="m.room.name"&&Y.state_key==="")?.content?.name;if(typeof h==="string")c.name=h;const F=p.find((Y)=>Y.type==="m.room.topic"&&Y.state_key==="")?.content?.topic;if(typeof F==="string")c.topic=F;const x=p.find((Y)=>Y.type==="m.room.join_rules"&&Y.state_key==="")?.content?.join_rule;if(typeof x==="string")c.joinRule=x;const H=p.find((Y)=>Y.type==="m.room.guest_access"&&Y.state_key==="")?.content?.guest_access;if(typeof H==="string")c.guestAccess=H;const W=p.find((Y)=>Y.type==="m.room.history_visibility"&&Y.state_key==="")?.content?.history_visibility;if(typeof W==="string")c.historyVisibility=W;const Q=p.filter((Y)=>Y.type==="m.space.child").map((Y)=>Y.state_key);if(Q.length>0)c.children=await Promise.all(Q.map((Y)=>Kf(_,Y)))}catch{}return c}function Nf({identity:_,roomId:f}){const[c,p]=z(!1),[l,$]=z(""),h=J(async(F)=>{F.preventDefault(),F.stopPropagation(),p(!0);try{const x=await Kf(_,f);$(JSON.stringify(x,null,2))}catch(x){$(x)}finally{p(!1)}},[_,f]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}`}
        >Room to JSON</>
        <main>
            <h2>${f}</h2>
            <button
                disabled=${c}
                type="button"
                onclick=${h}
            >Load</button>
            ${c&&O`<progress />`}
            <textarea value=${l} />
        </main>
        <${P} />
    `}async function pc(_,f,c){const p={};try{const l=await L(_,f),$=l.find((D)=>D.type==="m.room.create"&&D.state_key==="")?.content;if(typeof $==="object"&&["undefined","string"].includes(typeof $.type))p.type=$?.type;else p.type="!invalid!";if(typeof $==="object"&&["undefined","string"].includes(typeof $.room_version))p.roomVersion=$?.room_version??"1";else p.roomVersion="!invalid!";const h=l.find((D)=>D.type==="m.room.power_levels"&&D.state_key==="")?.content;if(typeof h.users==="object")p.highestCustomPowerLevel=Math.max(...Object.values(h.users)),p.myPowerLevel=h.users[c]??h.users_default,p.defaultPowerLevel=h.users_default,p.canIBan=p.myPowerLevel>=h.ban,p.canIKick=p.myPowerLevel>=h.kick,p.canIInvite=p.myPowerLevel>=h.invite,p.canIRedact=p.myPowerLevel>=h.redact;const F=l.find((D)=>D.type==="m.room.encryption"&&D.state_key==="")?.content;if(p.encryption="false",typeof F?.algorithm==="string")p.encryption="true",p.encryptionAlgorithm=F?.algorithm;const x=l.find((D)=>D.type==="m.room.tombstone"&&D.state_key==="")?.content;if(typeof x?.body==="string")p.tombstoneBody=x?.body;if(typeof x?.replacement_room==="string")p.tombstoneReplacementRoom=x?.replacement_room;const H=l.find((D)=>D.type==="m.room.canonical_alias"&&D.state_key==="")?.content?.alias;if(typeof H==="string")p.canonicalAlias=H;const W=l.find((D)=>D.type==="m.room.name"&&D.state_key==="")?.content?.name;if(typeof W==="string")p.name=W;const Q=l.find((D)=>D.type==="m.room.avatar"&&D.state_key==="")?.content?.url;if(typeof Q==="string")p.avatarUrl=Q;const Y=l.find((D)=>D.type==="m.room.join_rules"&&D.state_key==="")?.content?.join_rule;if(typeof Y==="string")p.joinRule=Y;const V=l.find((D)=>D.type==="m.room.guest_access"&&D.state_key==="")?.content?.guest_access;if(typeof V==="string")p.guestAccess=V;const Z=l.find((D)=>D.type==="m.room.history_visibility"&&D.state_key==="")?.content?.history_visibility;if(typeof Z==="string")p.historyVisibility=Z;const X=l.filter((D)=>D.type==="m.space.child").map((D)=>D.state_key);p.spaceChildren=X.length}catch{}return p}var lc=function(_){const f=new Set;for(let c of _)f.add(c.slice(c.indexOf(":")+1));return[...f]};async function hc(_,f,c){const p=Object.keys((await V_(_,f)).joined);return{isDirect:$c(c,f)!==void 0,joinedMembers:p,joinedMembersCount:p.length,joinedHomeServers:lc(p),joinedDirectContacts:p.filter((l)=>(l in c))}}async function Wc(..._){try{return await Y_(..._)}catch(f){if(f.message==="Account data not found")return{};throw f}}async function*Fc(_){const f=(await R(_)).joined_rooms;let c=f.map((h)=>({roomId:h}));const p=(await S(_)).user_id,l=await Wc(_,p,"m.direct");yield{rows:c};let $=0;for(let h of f){try{const F=await pc(_,h,p);c=c.map((x)=>{if(x.roomId!==h)return x;return{...x,...F}})}catch(F){console.error(F)}try{const F=await hc(_,h,l);c=c.map((x)=>{if(x.roomId!==h)return x;return{...x,...F}})}catch(F){console.error(F)}$+=1,yield{progressValue:$,progressMax:f.length,rows:c}}}function Tf({identity:_}){const[f,c]=z(!1),[p,l]=z([]),[$,h]=z(void 0),[F,x]=z(void 0),[H,W]=z(""),Q=N(()=>[{Header:"ID",accessor:"roomId"},{Header:"Name",accessor:"name"},{Header:"Encrypted?",accessor:"encryption"},{Header:"My PL",accessor:"myPowerLevel"},{Header:"Replaced?",accessor:"tombstoneReplacementRoom"},{Header:"Members",accessor:"joinedMembersCount"},{Header:"Direct contacts",accessor:"joinedDirectContacts.length"},{Header:"Type",accessor:"type"},{Header:"Join Rule",accessor:"joinRule"},{Header:"History Visibility",accessor:"historyVisibility"}],[]),Y=J(async(V)=>{V.preventDefault(),V.stopPropagation(),c(!0),l([]),W("");try{for await(let Z of Fc(_))h(Z.progressValue),x(Z.progressMax),l(Z.rows),W(JSON.stringify(Z.rows,null,2))}catch(Z){W(Z)}finally{c(!1),h(void 0),x(void 0)}},[_]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}`}
        >Room List</>
        <main>
            <div>
                This feature has not been optimised. It fetches the entire room state of every joined room.
            </div>
            <button
                disabled=${f}
                type="button"
                onclick=${Y}
            >Start fetching</button>
            ${f&&O`<progress value=${$} max=${F} />`}
            <${D_} columns=${Q} data=${p} primaryAccessor="roomId" />
            <textarea readonly value=${H} />
        </main>
        <${P} />
    `}var $c=(_,f)=>{for(let[c,p]of Object.entries(_))if(p.includes(f))return c};var wf=function(_,f){for(let c of _.childrenInfo){const p=f.find((l)=>l.id===c.id)??c;if(_.children=_.children??[],_.children.push(p),p.childrenInfo)wf(p,f)}},xc=function(_){if(_.length===0)return[];console.log("rawRooms",_);const f=_.map((p)=>({id:p.room_id,name:p.name,joinRule:p.join_rule,childrenInfo:p.children_state.map((l)=>({id:l.state_key}))})),c=f.shift();return wf(c,f),[c]},uf=function({identity:_,rooms:f}){return O`<ul>
        ${f.map((c)=>O`
            <li key=${c.id}>
                <a href=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(c.id)}}`}>${c.name??c.id}</a>
            </li>
            ${c.children&&O`<${uf} key=${c.id} identity=${_} rooms=${c.children} />`}
        `)}
    </ul>`};function jf({identity:_,roomId:f}){const[c,p]=z(!1),[l,$]=z(),[h,F]=z(""),x=J(async(H)=>{H.preventDefault(),H.stopPropagation(),p(!0),$([]),F("");try{for await(let W of Jf(_,f))$(xc(W.rooms))}catch(W){console.error(W),F(W)}finally{p(!1)}},[_,f]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}`}
        >Space Viewer</>
        <main>
            <button
                disabled=${c}
                type="button"
                onclick=${x}
            >Start fetching</button>
            ${h&&O`<p>${h}</p>`}
            ${l&&O`<${uf} identity=${_} rooms=${l} />`}
        </main>
        <${P} />
    `}function Pf({identity:_}){return O`
        <${T}
            backLabel="Switch identity"
            backUrl="#"
        >${_.name??"No authentication"}</>
        <div class="card">
            <h2>Create/Mutate user</h2>
            <${Oc} identity=${_}/>
        </div>
        <${P} />
    `}var Oc=function({identity:_}){const[f,c]=z(!1),[p,l]=z(!1),[$,h]=z(!0),[F,x]=z(""),[H,W]=z(""),[Q,Y]=z(""),V=N(()=>({admin:f,deactivated:p,password:F,user_type:Q||null}),[f,p,F,Q]),Z=N(()=>({userId:H}),[H]);return O`
        <${__}
            body=${V}
            identity=${_}
            method="PUT"
            requiresConfirmation=${!0}
            url="/_synapse/admin/v2/users/!{userId}"
            variables=${Z}
        >
            <${j}
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @user:server.com"
                value=${H}
                oninput=${J(({target:X})=>W(X.value),[])}
            />
            <${j}
                label="Password"
                title="Optional password"
                value=${F}
                oninput=${J(({target:X})=>x(X.value),[])}
            />
            <p>
                <label>User type
                    <select
                        oninput=${J(({target:X})=>Y(X.value),[])}
                    >
                        <option value="">None</>
                        <option value="bot">Bot</>
                        <option value="support">Support</>
                    </select>
                </label>
            </p>
            <ul class="checkbox-list">
                <li><label>
                    <input
                        checked=${$}
                        type="checkbox"
                        onChange=${J(({target:X})=>h(X.checked),[])}
                    />
                    Log out all devices
                </label></li>
                <li><label>
                    <input
                        checked=${f}
                        type="checkbox"
                        onChange=${J(({target:X})=>c(X.checked),[])}
                    />
                    Synapse admin
                </label></li>
                <li><label>
                    <input
                        checked=${p}
                        type="checkbox"
                        onChange=${J(({target:X})=>l(X.checked),[])}
                    />
                    Deactivated
                </label></li>
            </ul>
            <button>Create/mutate user</button>
        </>
    `};async function Mf(_,f,c){const p=await fetch(`${_}/_matrix/client/v3/login`,{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({type:"m.login.password",identifier:{type:"m.id.user",user:f},password:c})});if(!p.ok)throw Error("Failed to log in.");return await p.json()}var Yc=function({identity:_,roomId:f}){const c=N(()=>({roomId:f}),[f]);return O`
        <div>
            <${zc} identity=${_} roomId=${f} />
        </div>
        <${n}
            identity=${_}
            label="Knock"
            method="POST"
            url="/_matrix/client/v3/knock/!{roomId}"
            variables=${c}
            body=${Hc}
        />
        <${n}
            identity=${_}
            label="Join"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/join"
            variables=${c}
        />
        <${n}
            identity=${_}
            label="Leave"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/leave"
            variables=${c}
        />
        <${n}
            identity=${_}
            label="Forget"
            method="POST"
            url="/_matrix/client/v3/rooms/!{roomId}/forget"
            variables=${c}
        />
        <hr/>
        <h3>Moderation</h3>
        <${oc} identity=${_} roomId=${f}/>
        <hr/>
        <h3>Other pages</h3>
        <nav><ul>
            <li><a href=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}/invite`}>Bulk invite</a></li>
            <li><a href=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}/kick`}>Bulk kick</a></li>
            <li><a href=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}/mass-joiner`}>Mass joiner (AppService API)</a></li>
            <li><a href=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}/yaml`}>JSON export</a></li>
        </ul></nav>
    `},Vc=function({identity:_,roomId:f}){const[c,p]=z(""),l=N(()=>({user_id:c}),[c]),$=N(()=>({roomId:f}),[f]);return O`
        <${__}
            body=${l}
            identity=${_}
            method="POST"
            requiresConfirmation=${!0}
            url="/_synapse/admin/v1/rooms/!{roomId}/make_room_admin"
            variables=${$}
        >
            <${j}
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @foo:matrix.org"
                value=${c}
                oninput=${J(({target:h})=>p(h.value),[])}
            />
            <button>Make user a room admin</button>
        </>
    `},bf=function({identity:_}){const[f,c]=z(!1),[p,l]=z(null),$=J(async(h)=>{h.preventDefault(),h.stopPropagation(),c(!0);try{const F=await S(_);l(F)}catch(F){if(F instanceof d){if(F.content.errcode==="M_UNKNOWN_TOKEN")l({device_id:"Invalid access token",user_id:"Invalid access token"})}else alert(F)}finally{c(!1)}},[_]);return O`
        <button
            disabled=${f}
            style="width: 120px"
            type="button"
            onclick=${$}
        >Who am I?</button>
        <p>
            Matrix ID: ${p?.user_id||"unknown"}
            <br/>
            Device ID: ${p?.device_id||"unknown"}
        </p>
    `},zc=function(_){const f=`${_.identity?.name}|${_.roomId}`;return O`<${Dc} key=${f} ...${_}/>`},Dc=function({identity:_,roomId:f}){const[c,p]=z(!1),[l,$]=z(null),h=J(async(F)=>{F.preventDefault(),F.stopPropagation(),p(!0),$("updating\u2026");try{const x=(await S(_)).user_id,H=await L(_,f,"m.room.member",x);$({ban:"banned",join:"joined",knock:"knocking",leave:"left"}[H.membership]??H.membership)}catch(x){if(x instanceof d&&typeof x.content?.errcode==="string")if(x.content.errcode==="M_UNKNOWN_TOKEN")$("Invalid access token");else if(x.content.errcode==="M_FORBIDDEN")$("No access to room. It may not exist.");else if(x.content.errcode==="M_NOT_FOUND")$("No member event for you found.");else $(`Not a member. Server replied with the error ${x.content.errcode}.`);else alert(x),$(null)}finally{p(!1)}},[_,f]);return O`
        <button
            disabled=${c}
            type="button"
            onclick=${h}
        >Am I a member?</button> Result: ${l||"unknown"}
    `},Jc=function({serverAddress:_,onAccessToken:f}){const[c,p]=z(""),[l,$]=z(""),h=J(async(F)=>{F.preventDefault(),F.stopPropagation();const x=await Mf(_,c,l);f(x.access_token)},[l,_,c,f]);return O`
        <form onsubmit=${h}>
            <div>
                <${j}
                    label="Matrix ID or user name"
                    name="user"
                    value=${c}
                    oninput=${J(({target:F})=>p(F.value),[])}
                />
            </div>
            <div>
                <${j}
                    autocomplete="current-password"
                    label="Password"
                    name="password"
                    value=${l}
                    type="password"
                    oninput=${J(({target:F})=>$(F.value),[])}
                />
            </div>
            <button>Get access token</button>
        </div>
    `},Zc=function({identityName:_}){const{identities:f,setIdentities:c}=b(v),[p,l]=z(null),$=N(()=>{return f.find((F)=>F.name===_)??{}},[f,_]),h=J((F)=>{l(null),c((x)=>{const H=[...x];if(!F.name)return l("Identity must have a name!"),x;const W=H.findIndex((Y)=>Y.name===_);if(H.findIndex((Y)=>Y.name===F.name)!==-1&&_!==F.name)return l("Identity name taken!"),x;if(W===-1)H.push(F);else H.splice(W,1,F);if(F.rememberLogin)try{Ef(H)}catch(Y){console.warn("Failed to store identities in localStorage",Y)}return l(null),window.location="#",H})},[_,c]);return O`<${Qc}
        error=${p}
        identity=${$}
        onSave=${h}
    />`},Qc=function({error:_,identity:f,onSave:c}){const[p,l]=z(f.name??""),[$,h]=z(f.serverAddress??""),[F,x]=z(f.accessToken??""),[H,W]=z(f.masqueradeAs??""),[Q,Y]=z("accessToken"),[V,Z]=z(f.rememberLogin??!1),X=J((K)=>{x(K),Y("accessToken")},[]),D=J(({target:K})=>x(K.value),[]),G=J(({target:K})=>W(K.value),[]),M=N(()=>({serverAddress:$,accessToken:F,masqueradeAs:H}),[$,F,H]),B=J((K)=>{K.preventDefault(),K.stopPropagation(),c({name:p,serverAddress:$,accessToken:F,rememberLogin:V,masqueradeAs:H||void 0})},[F,H,p,V,$,c]),k=J(({target:K})=>Z(K.checked),[]);return O`
        <${T}
            backUrl="#"
        >Identity Editor</>
        <form class="identity-editor-form" onsubmit=${B}>
            <div>
                <${j}
                    label="Name"
                    name="name"
                    pattern="[^\\\/]+"
                    required
                    value=${p}
                    oninput=${J(({target:K})=>l(K.value),[])}
                />
            </div>
            ${p.includes("/")&&O`<p>The identity name must not include a slash character (/).</p>`}
            <div>
                <${j}
                    label="Server address (e.g. https://matrix-client.matrix.org)"
                    name="url"
                    type="url"
                    required
                    value=${$}
                    oninput=${J(({target:K})=>h(K.value),[])}
                />
            </div>
            <div>
                <fieldset>
                    <legend>Authorization method</legend>

                    <label>
                        <input
                            type="radio"
                            name="authType"
                            checked=${Q==="accessToken"}
                            onclick=${J(()=>Y("accessToken"),[])}
                        />
                        Access Token
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="authType"
                            checked=${Q==="password"}
                            onchange=${J(()=>Y("password"),[])}
                        />
                        Password
                    </label>
                </fieldset>
            </div>
            ${Q==="accessToken"?O`
                <div>
                    <${j}
                        autocomplete="current-password"
                        label="Access token"
                        name="accessToken"
                        value=${F}
                        type="password"
                        oninput=${D}
                    />
                </div>
                <div>
                    <${j}
                        autocomplete=""
                        label="Masquerade As Matrix ID (for AppService tokens)"
                        name="masqueradeAs"
                        pattern="@.+:.+"
                        value=${H}
                        oninput=${G}
                    />
                </div>
            `:O`
                <${Jc}
                    serverAddress=${$}
                    onAccessToken=${X}
                />
            `}
            ${!!localStorage&&O`
                <div>
                    <ul class="checkbox-list">
                        <li><label>
                            <input
                                checked=${V}
                                type="checkbox"
                                onChange=${k}
                            />
                            Save to localStorage
                        </label></li>
                    </ul>
                </div>
            `}
            ${!!_&&O`<p>${_}</p>`}
            <div class="card">
                <${bf} identity=${M}/>
            </div>
            <a class="button" href="#">Cancel</a>
            <button type="submit" class="primary">Save</button>
        </form>
    `},Xc=function({invalid:_,status:f}){let c="...",p="Fetching data\u2026";if(f===null)c="NET",p="Network error";else if(f)c=f,p=`HTTP ${f}`;if(_)c="!{}",p="Invalid JSON response";return O`
        <span
            class=${$f("network-log-request_status",{"network-log-request_status--success":f>=200&&f<300,"network-log-request_status--client-error":f>=400&&f<500,"network-log-request_status--server-error":f>=500||_,"network-log-request_status--network":f===null,"network-log-request_status--pending":f===void 0})}
            title=${p}
        >${c}</span>
    `},Gc=function({request:_}){return O`
        <li value=${_.id}><details>
            <summary>
                <div class="network-log-request_header">
                    <span class="network-log-request_summarized-fetch">${Ff(_.resource,_.init)}</span>
                    <span class="network-log-request_time">${_.sent.toLocaleTimeString()}</span>
                    <${Xc} invalid=${_.isNotJson} status=${_.status}/>
                </div>
            </summary>
            <div>
                <strong>Sent:</strong> ${_.sent.toLocaleString()}
            </div>
            ${_.received&&O`
                <div>
                    <strong>Received:</strong> ${_.received.toLocaleString()}
                </div>
            `}
            ${_.errcode&&O`
                <div>
                    <strong>Error Code:</strong> ${_.errcode}
                </div>
            `}
            ${_.error&&O`
                <div>
                    <strong>Error:</strong> ${_.error}
                </div>
            `}
            <div>
                <strong>Curl command:</strong>
                <code class="network-log-request_curl">${Wf(_.resource,_.init)}</code>
            </div>
        </details></li>
    `},Uc=function({children:_}){const[f,c]=z({isShortened:!1,requests:[]});return C(()=>{const p=($)=>{c((h)=>{return{...h,isShortened:h.requests.length>=Af,requests:[...h.requests,{id:$.detail.requestId,init:$.detail.init,resource:$.detail.resource,sent:new Date}].slice(-Af)}})},l=($)=>{c((h)=>{const F=h.requests.findIndex((H)=>H.id===$.detail.requestId);if(F===-1)return h;const x={...h.requests[F],errcode:$.detail.errcode||null,error:$.detail.error||null,received:new Date,status:$.detail.status||null};return{...h,requests:[...h.requests.slice(0,F),x,...h.requests.slice(F+1)]}})};return window.addEventListener("matrix-request",p),window.addEventListener("matrix-response",l),()=>{window.removeEventListener("matrix-request",p),window.removeEventListener("matrix-response",l)}},[]),O`
        <${Bf.Provider} value=${f}>
            ${_}
        </>
    `};function P(){const{showNetworkLog:_}=b(v),{isShortened:f,requests:c}=b(Bf);if(!_)return;return O`
        <h2>Network Log</h2>
        ${f&&O`<p>Older entries have been removed.</p>`}
        ${c.length===0?O`
            <p>Requests to Matrix homeservers will be listed here.</p>
        `:O`
            <ol class="network-log_list">
                ${c.map((p)=>O`<${Gc} key=${p.id} request=${p}/>`)}
            </ol>
        `}
    `}var kc=function({children:_}){const[f,c]=z({externalMatrixUrl:"https://matrix.to/#/",identities:Lf,showNetworkLog:!0});return C(()=>{const p=(h)=>{c((F)=>({...F,externalMatrixUrl:h}))},l=(h)=>{c((F)=>({...F,identities:h(F.identities)}))},$=(h)=>{c((F)=>({...F,showNetworkLog:h}))};c((h)=>({...h,setExternalMatrixUrl:p,setIdentities:l,setShowNetworkLog:$}))},[]),O`
        <${v.Provider} value=${f}>
            ${_}
        </>
    `},Kc=function({identity:_,onDelete:f}){return O`<li>
        <a
            class="identity-page_name"
            href=${`#/${_.name}`}
        >${_.name}</a>
        <a
            class="identity-page_action"
            href="#identity/${_.name}"
            title="Edit identity ${_.name}"
        >✏️</a>
        <button
            class="identity-page_action"
            title="Delete identity ${_.name}"
            type="button"
            onclick=${J(()=>f(_),[_,f])}
        >❌</button>
    </li>`},Nc=function({identities:_,onDelete:f}){return O`
        ${_.map((c)=>{return O`<${Kc}
                key=${c.name}
                identity=${c}
                onDelete=${f}
            />`})}
    `},Tc=function({identity:_}){const[f,c]=z(""),[p,l]=z(!1),[$,h]=z(""),F=J(async(x)=>{x.preventDefault(),x.stopPropagation(),l(!0);try{const H=await e(_,f);h(H.room_id)}catch(H){alert(H)}finally{l(!1)}},[f,_]);return O`
        <form onsubmit=${F}><fieldset disabled=${p}>
            <${j}
                label="Room alias"
                pattern="#.+:.+"
                required
                title="A room alias starting with a number sign, e.g. #matrixhq:matrix.org"
                value=${f}
                oninput=${J(({target:x})=>c(x.value),[])}
            />
            <button type="submit">Resolve</button>
        </fieldset></form>
        <div>
            <strong>Room id:</strong>
            <code style="border: 2px black dotted; user-select:all; margin-left: .5em">${$||"N/A"}</code>
        </div>
    `},Ef=function(_){if(!localStorage)return;const f=_.filter((c)=>c.rememberLogin).map((c)=>{const p={...c};return delete p.rememberLogin,p});localStorage.setItem("identities",JSON.stringify(f))},wc=function({identity:_}){return O`
        <h2>Other pages</h2>
        <nav><ul>
            <li><a href=${`#/${encodeURIComponent(_.name)}/overview`}>Overview</a></li>
        </ul></nav>
    `},uc=function({identity:_}){const[f,c]=z("");return O`
        <h2>Register account (AppService API)</h2>
        <${j}
            label="Username"
            required
            value=${f}
            oninput=${J(({target:p})=>c(p.value),[])}
        />
        <${n}
            identity=${_}
            label="Create account"
            method="POST"
            url="/_matrix/client/v3/register"
            body=${{type:"m.login.application_service",username:f}}
        />
    `},jc=function({identity:_,roomId:f}){const[c,p]=z(""),l=N(()=>({msgtype:"m.text",body:c}),[c]),$=N(()=>({eventType:"m.room.message",roomId:f,txnId:y("msg-")}),[f,c]);return O`
    
        <${__}
            body=${l}
            identity=${_}
            method="PUT"
            url="/_matrix/client/v3/rooms/!{roomId}/send/!{eventType}/!{txnId}"
            body=${l}
            variables=${$}
        >
            <${j}
                label="Message"
                required
                value=${c}
                oninput=${J(({target:h})=>p(h.value),[])}
            />
            <button>Send message</button>
        </>
    `},Pc=function({identity:_,roomId:f}){return O`
        <${T}
            backLabel="Switch identity"
            backUrl="#"
        >${_.name??"No authentication"}</>
        <div style="display: flex; flex-direction: column">
            ${_.accessToken?O`
                <div class="card">
                    <${bf} identity=${_}/>
                </div>
                <div class="card">
                    <${wc} identity=${_}/>
                </div>
                <div class="card">
                    <${uc} identity=${_}/>
                </div>
                <${Cc} identity=${_} roomId=${f}/>
            `:O`
                <div class="card">
                    <h2>Alias to Room ID</h2>
                    <${Tc} identity=${_}/>
                </div>
            `}
        </div>
        <${P} />
    `},Mc=function(){const{identities:_,setIdentities:f}=b(v),c=J(async(p)=>{if(!await E(`Do you want to remove ${p.name}?\nThis doesn't invalidate the access token.`))return;f(($)=>{const h=$.filter((F)=>F.name!==p.name);try{Ef(h)}catch(F){console.warn("Failed to store identities in localStorage",F)}return h})},[f]);return O`
        <${T}>Identities</>
        <main>
        ${_.length===0?O`
                <p>
                    Hi there! Need to tweak some Matrix rooms?<br/>
                    First, you need to add an identity. An identity is a combination of a homeserver URL and an access token.<br/>
                    Wrench can handle multiple identities. It assumes that identities are sensitive, so they aren't stored by default.
                </p>
            `:O`
                <p>Choose an identity. An identity is a combination of a homeserver URL and an access token.</p>
                <ul class="identity-page_list">
                    <${Nc} identities=${_} onDelete=${c} />
                </ul>
            `}
            <a class="button" href="#identity">Add identity</a>
        </main>
    `},qf=function({roomIds:_,onSelectRoom:f}){const{externalMatrixUrl:c}=b(v),p=J((l)=>{l.preventDefault(),l.stopPropagation(),f(l.target.dataset.roomId)},[f]);if(_.length===0)return O`
            <p>There's no room in this list.</p>
        `;return O`
        <ul style="overflow-x: auto">
            ${_.map((l)=>O`
                <li key=${l}>
                    ${f?O`
                        <button
                            type="button"
                            data-room-id=${l}
                            onclick=${p}
                        >${l}</button>
                    `:l}
                    <a
                        href=${`${c}${encodeURIComponent(l)}`}
                        rel="noopener noreferrer"
                        target="_blank"
                        title="Open room externally"
                    >
                        <img alt="" src="./assets/external-link.svg" />
                    </a>
                </li>
            `)}
        </ul>
    `},Ac=function({identity:_,onSelectRoom:f}){const[c,p]=z(null),[l,$]=z(!1),h=J(async()=>{$(!0);try{const{joined_rooms:F}=await R(_);p(F)}catch(F){alert(F)}finally{$(!1)}},[_]);return O`
        <h3>Joined rooms</h3>
        <button disabled=${l} type="button" onclick=${h}>Query joined rooms</button>
        ${c&&O`<${qf} roomIds=${c} onSelectRoom=${f}/>`}
    `},Cc=function({identity:_,roomId:f}){const[c,p]=z(""),[l,$]=z(null),[h,F]=z([]),[x,H]=z(!1),W=J((Z)=>{window.location=`#/${encodeURIComponent(_.name)}/${encodeURIComponent(Z)}`,F((X)=>[Z,...X.filter((D)=>D!==Z)].slice(0,4))},[_.name]),Q=J(async(Z)=>{Z.preventDefault(),Z.stopPropagation();let X=c;if(c.startsWith("#")){H(!0);try{X=(await e(_,c)).room_id}catch(D){console.warn(D);const G=`Couldn't resolve alias! ${D}`;alert(G);return}finally{H(!1)}}$(X)},[_,c]),Y=J(async(Z)=>{Z.preventDefault(),Z.stopPropagation();let X=c;if(c.startsWith("#")){H(!0);try{X=(await e(_,c)).room_id}catch(D){console.warn(D);const G=`Couldn't resolve alias! ${D}`;alert(G);return}finally{H(!1)}}window.location=`#/${encodeURIComponent(_.name)}/${encodeURIComponent(X)}`,$(X),F((D)=>[X,...D.filter((G)=>G!==X)].slice(0,4))},[_,c]),V=J(()=>{window.location=`#/${encodeURIComponent(_.name)}`},[_.name]);if(f)return O`
            <hr/>
            <button onclick=${V}>Switch to a different room</button>
            <${qc} identity=${_} roomId=${f}/>
        `;return O`
        <div class="card">
            <h2>Room management</h2>
            <form onsubmit=${Y}><fieldset disabled=${x}>
                <${j}
                    name="room"
                    label="Room alias or ID"
                    pattern="[!#].+:.+"
                    required
                    value=${c}
                    oninput=${({target:Z})=>p(Z.value)}
                />
                <button
                    disabled=${!c.startsWith("#")}
                    type="button"
                    onclick=${Q}
                >Resolve alias</button>
                <button type="submit" class="primary">Open details</button>
            </fieldset></form>
            <div>
                <strong>Room id:</strong>
                <code style="border: 2px black dotted; user-select:all; margin-left: .5em">${l||"N/A"}</code>
            </div>
            <aside>
                ${h.length>0&&O`
                    <h3>Recent rooms</h3>
                    <${qf} roomIds=${h} onSelectRoom=${W}/>
                `}
                <${Ac} identity=${_} onSelectRoom=${W}/>
            </aside>
        </div>
    `};async function vf(_,f,c,p){if(c===0)return;const $=(await L(_,f)).filter((h)=>h.type==="m.space.child"&&Array.isArray(h.content.via));for(let h of $){if(p.has(h.state_key))continue;p.set(h.state_key,{roomId:h.state_key}),await vf(_,h.state_key,c-1,p)}}async function Lc(_,f,c=1){const p=new Map;return await vf(_,f,c,p),[...p.values()]}async function Bc(_,f,c={}){await w(...u(_,`${_.serverAddress}/_synapse/admin/v2/rooms/${encodeURIComponent(f)}`,{method:"DELETE",body:JSON.stringify(c)}))}var bc=function({identity:_,roomId:f}){const[c,p]=z(!1),[l,$]=z(void 0),[h,F]=z(void 0),[x,H]=z(!1),[W,Q]=z(!0),[Y,V]=z(!1),Z=J((K)=>{K.preventDefault(),K.stopPropagation()},[]),X=J((K)=>{if(!K)$(void 0);p(K)},[]),D=J(()=>H((K)=>!!K),[]),G=J(()=>Q((K)=>!!K),[]),M=J(()=>V((K)=>!!K),[]),B=N(()=>({block:x,purge:W,force_purge:Y}),[x,W,Y]),k=N(()=>({roomId:f}),[f]);return O`
        <form onsubmit=${Z}><fieldset disabled=${c}>
            <ul class="checkbox-list">
                <li><label>
                    <input
                        checked=${x}
                        type="checkbox"
                        onChange=${D}
                    />
                    Block in the future
                </label></li>
                <li><label>
                    <input
                        checked=${W}
                        type="checkbox"
                        onChange=${G}
                    />
                    Purge from database
                </label></li>
                <li><label>
                    <input
                        checked=${Y}
                        type="checkbox"
                        onChange=${M}
                    />
                    Purge even if local users cannot be removed
                </label></li>
            </ul>
            ${c&&O`
                <div>
                    <progress max=${h} value=${l}>Deleted ${l} of ${h} rooms.</progress>
                </div>
            `}
            <${n}
                body=${B}
                identity=${_}
                label="Delete room"
                method="DELETE"
                requiresConfirmation
                url="/_synapse/admin/v2/rooms/!{roomId}"
                variables=${k}
            />
            <${Ec}
                body=${B}
                identity=${_}
                roomId=${f}
                onBusy=${X}
                onProgress=${$}
                onTotal=${F}
            />
        </fieldset></form>
    `},Ec=function({body:_,identity:f,roomId:c,onBusy:p,onProgress:l,onTotal:$}){const h=J(async()=>{p(!0);try{let F=await E("Fetching a list of all subspaces and rooms can take many minutes.\nAre you ok to wait?");if(!F)return;const x=await Lc(f,c,-1),H=new Set(x.map((Q)=>Q.roomId));if(H.add(c),$(H.size),F=await E(`Found ${H.size} rooms (includes spaces) to delete.\nAre you sure you want to DELETE ALL?`),!F)return;let W=0;for(let Q of H.values()){try{await Bc(f,Q,_)}catch(Y){if(!await E(`Failed to delete room ${Q}.\n${Y.error||Y.message}\nContinue?`))return}W+=1,l(W)}}finally{p(!1)}},[_,f,c,p,l,$]);return O`
        <button type="button" onclick=${h}>Delete space recursively</button>
    `},qc=function({identity:_,roomId:f}){return O`
        <h2>${f}</h2>
        <div class="page">
            <div class="section">
                <details open>
                    <summary><h2>Summary</h2></summary>
                    <${Rc} identity=${_} roomId=${f}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Membership</h2></summary>
                    <${Yc} identity=${_} roomId=${f}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Members</h2></summary>
                    <${ic} identity=${_} roomId=${f}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>State</h2></summary>
                    <${mc} identity=${_} roomId=${f}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Send message</h2></summary>
                    <${jc} identity=${_} roomId=${f}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Aliases</h2></summary>
                    <${gc} identity=${_} roomId=${f}/>
                </details>
            </div>
            <div class="section">
                <details open>
                    <summary><h2>Room Upgrade (experimental)</h2></summary>
                    <${Ic} identity=${_} roomId=${f}/>
                </details>
            </div>
            <div class="section">
                <details>
                    <summary><h2>Synapse Admin</h2></summary>
                    <${Vc} identity=${_} roomId=${f}/>
                    <hr/>
                    <h3>Remove users and delete room</h3>
                    <${bc} identity=${_} roomId=${f}/>
                </details>
            </div>
            <div class="section">
                <details>
                    <summary><h2>Media (Synapse Admin)</h2></summary>
                    <${sc} identity=${_} roomId=${f}/>
                </details>
            </div>
        </div>
    `},vc=function(){const{externalMatrixUrl:_,setExternalMatrixUrl:f,showNetworkLog:c,setShowNetworkLog:p}=b(v);return O`
        <${T}
            backUrl="#"
        >Settings</>
        <main>
            <form>
                <${j}
                    name="external_matrix_links"
                    label="External Matrix links"
                    value=${_}
                    oninput=${J(({target:l})=>f(l.value),[f])}
                />
                <ul class="checkbox-list">
                    <li><label>
                        <input
                            checked=${c}
                            type="checkbox"
                            onChange=${J(({target:l})=>p(l.checked),[p])}
                        />
                        Show network log
                    </label></li>
                </ul>
            </form>
        </main>
        <${P} />
    `},gc=function({identity:_,roomId:f}){const[c,p]=z(""),[l,$]=z(!1),h=J(async(F)=>{F.preventDefault(),F.stopPropagation();const x=F.submitter.getAttribute("value");$(!0);try{if(x==="add")await Of(_,c,f);else if(x==="remove"){const H=await e(_,c);if(H.room_id!==f){let W="Alias is not mapped to this room.";if(H.room_id)W+=` Instead, it's mapped to ${H.room_id}.`;throw Error(W)}await Hf(_,c)}}catch(H){alert(H)}finally{$(!1)}},[c,_,f]);return O`
        <form onsubmit=${h}><fieldset disabled=${l}>
            <${j}
                label="Alias"
                pattern="#.+:.+"
                required
                title="A room alias, e.g. #matrix:matrix.org"
                value=${c}
                oninput=${J(({target:F})=>p(F.value),[])}
            />
            <button type="submit" value="add">Add</button>
            <button type="submit" value="remove">Remove</button>
        </fieldset></form>
    `},Rc=function(_){const f=`${_.identity?.name}|${_.roomId}`;return O`<${Sc} key=${f} ...${_}/>`},Sc=function({identity:_,roomId:f}){const[c,p]=z(!1),[l,$]=z(),h=J(async()=>{p(!0);try{$(await L(_,f))}finally{p(!1)}},[_,f]);return O`
        <button disabled=${c} type="button" onclick=${h}>Get state</button>
        ${l&&O`<${rc} identity=${_} stateEvents=${l}/>`}
    `},nc=function(_,f){let c=f;for(let p of Object.values(_?.users??{}))if(c<p)c=p;return c},ac=function(_,f){const c=[];for(let[p,l]of Object.entries(_?.events??{}))if(f<l)c.push(p);return c.length===0?void 0:c},rc=function({identity:_,stateEvents:f}){const c=f.find((V)=>V.type==="m.room.create"&&V.state_key==="")?.content?.["m.federate"]??!0,p=f.find((V)=>V.type==="m.room.power_levels"&&V.state_key==="")?.content,l=f.find((V)=>V.type==="m.room.power_levels"&&V.state_key==="")?.content?.algorithm,$=f.find((V)=>V.type==="m.room.join_rules"&&V.state_key==="")?.content?.join_rule,h=f.find((V)=>V.type==="m.room.history_visibility"&&V.state_key==="")?.content?.history_visibility,F=p?.users_default,x=nc(p,F),H=f.find((V)=>V.type==="m.room.create"&&V.state_key==="")?.content?.predecessor?.room_id,W=f.find((V)=>V.type==="m.room.create"&&V.state_key==="")?.content?.room_version,Q=f.find((V)=>V.type==="m.room.tombstone"&&V.state_key==="")?.content?.replacement_room,Y=ac(p,x);return O`
        <ul>
            <li>This room does ${c===!1&&O`<strong>NOT</strong> `}federate.</li>
            ${W&&O`<li>The room version is ${W}.</li>`}
            ${H&&O`<li>This room replaced <${q} identity=${_} roomId=${H}/>.</li>`}
            ${Q&&O`<li>⚠️ This room was replaced by <${q} identity=${_} roomId=${Q}/>.</li>`}
            ${typeof x==="number"&&O`<li>The highest power level is ${x}.</li>`}
            ${Y&&O`<li><strong>⚠️Unusual:</strong> No user has the power level to post these event types: ${Y.join(", ")}</li>`}
            ${Y?.includes("m.room.power_levels")&&O`<li><strong>💔Broken:</strong> No user can change the power levels.</li>`}
            ${F>=x&&O`<li><strong>⚠️Unusual:</strong> No user has a higher power level than the default.</li>`}
            ${l&&h==="world_readable"&&O`<li><strong>⚠️Unusual:</strong> The room uses encryption but is readable without joining.</li>`}
            ${l&&$==="public"&&O`<li><strong>⚠️Unusual:</strong> The room uses encryption but is publicly joinable.</li>`}
        </ul>
    `},yc=function(_,f){if(f.some((h)=>h.type==="m.room.tombstone"&&h.state_key===""))throw Error("Room already has a tombstone.");const p=f.find((h)=>h.type==="m.room.power_levels"&&h.state_key==="")?.content,l=p.events?.["m.room.tombstone"]??p.events_default,$=p.users?.[_]??p.users_default;if(typeof l!=="number")throw Error("Unsure which power level is required for a tombstone.");if(typeof $!=="number")throw Error("Unsure which power level is required for a tombstone.");if($<l)throw Error("Insufficient permission to place tombstone.")},Ic=function({identity:_,roomId:f}){const[c,p]=z(""),[l,$]=z(!1),h=J((W)=>{W.preventDefault(),W.stopPropagation()},[]),F=J(async()=>{$(!0);try{const W=await L(_,f),Q=[],Y=(await S(_)).user_id;yc(Y,W);for(let D of W){if(["m.room.create","m.room.encryption","m.room.member","m.room.power_levels"].includes(D.type))continue;Q.push({content:D.content,type:D.type,state_key:D.state_key})}const V=W.find((D)=>D.type==="m.room.power_levels"&&D.state_key==="")?.content;if(!V)throw Error("No m.room.power_levels state found.");console.log(V),console.log(Q);const Z=await zf(_,f,"m.room.message",{msgtype:"m.text",body:"This room will be replaced."}).event_id;console.log(Z);const X=(await t(_,{creation_content:{predecessor:{room_id:f,event_id:Z}},initial_state:Q,power_level_content_override:V})).room_id;console.log(X),p(X)}catch(W){alert(W)}finally{$(!1)}},[_,f]),x=J(async()=>{$(!0);try{const W=await K_(_,f),Q=gf(W.chunk),Y=(await S(_)).user_id,V=Q.get("join").filter((Z)=>Z!==Y&&!Z.startsWith("@slack_"));for(let Z of V)await z_(_,c,Z)}catch(W){alert(W)}finally{$(!1)}},[c,_,f]),H=J(async()=>{$(!0);try{await T_(_,f,"m.room.tombstone","",{replacement_room:c})}catch(W){alert(W)}finally{$(!1)}},[c,_,f]);return O`
        <form onsubmit=${h}><fieldset disabled=${l}>
            <ol>
                <li>
                    <button disabled=${l} type="button" onclick=${F}>Create new room</button>
                    <${j}
                        label="Replacement room"
                        pattern="!.+"
                        title="A room id"
                        value=${c}
                        oninput=${J(({target:W})=>p(W.value),[])}
                    />
                </li>
                <li><button disabled=${l} type="button" onclick=${x}>Invite members</button></li>
                <li><button disabled=${l} type="button" onclick=${H}>Create tombstone</button></li>
            </ol>
        </fieldset></form>
    `},oc=function({identity:_,roomId:f}){const[c,p]=z(""),[l,$]=z(""),[h,F]=z(!1),x=J(async(H)=>{H.preventDefault(),H.stopPropagation();const W=H.submitter.getAttribute("value");F(!0);try{if(W==="ban")await xf(_,f,c,l);else if(W==="invite")await z_(_,f,c);else if(W==="kick")await N_(_,f,c,l);else if(W==="unban")await Df(_,f,c)}catch(Q){alert(Q)}finally{F(!1)}},[_,l,f,c]);return O`
        <form onsubmit=${x}><fieldset disabled=${h}>
            <${j}
                name="user_id"
                label="User"
                pattern="@.+:.+"
                required
                title="A user id, e.g. @foo:matrix.org"
                value=${c}
                oninput=${J(({target:H})=>p(H.value),[])}
            />
            <${j}
                name="kick_reason"
                label="Reason for kick or ban"
                title="A reason why this user gets kicked or banned."
                value=${l}
                oninput=${J(({target:H})=>$(H.value),[])}
            />
            <button type="submit" value="invite">Invite</button>
            <button type="submit" value="kick">Kick</button>
            <button type="submit" value="ban">Ban</button>
            <button type="submit" value="unban">Unban</button>
        </fieldset></form>
    `},mc=function({identity:_,roomId:f}){const[c,p]=z(""),[l,$]=z(""),[h,F]=z(!1),[x,H]=z(""),W=J(async(Y)=>{if(Y.preventDefault(),Y.stopPropagation(),!c){if(!await E("Room states can be REALLY big.\nConfirm, if you don\'t want to filter for a type."))return}F(!0);try{const V=await L(_,f,c||void 0,l||void 0);H(JSON.stringify(V,null,2))}catch(V){console.warn(V),H(V.message)}finally{F(!1)}},[_,f,l,c]),Q=J(async(Y)=>{if(Y.preventDefault(),Y.stopPropagation(),F(!0),!c)alert("type is required when setting a state!");try{let V;try{V=JSON.parse(x)}catch(D){alert("Invalid JSON",D);return}let Z=`Do you want to set ${c} `;if(l)Z+=`with state_key ${l} `;if(Z+=`in room ${f}?`,!await E(Z))return;await T_(_,f,c,l||void 0,V)}catch(V){alert(V)}finally{F(!1)}},[x,_,f,l,c]);return O`
        <form onsubmit=${W}><fieldset disabled=${h}>
            <${j}
                name="state_type"
                label="Type"
                list="state-types"
                value=${c}
                oninput=${J(({target:Y})=>p(Y.value),[])}
            />
            <${j}
                name="state_key"
                label="State Key"
                value=${l}
                oninput=${J(({target:Y})=>$(Y.value),[])}
            />
            <button type="submit">Query</button>
        </fieldset></form>
        <form onsubmit=${Q}><fieldset disabled=${h}>
            <label>State
                <textarea
                    value=${x}
                    oninput=${J(({target:Y})=>H(Y.value),[])}
                />
            </label>
            <div><button type="submit">Overwrite state</button></div>
        </fieldset></form>
    `},f_=function({members:_}){if(_.length===0)return O`
            <p>There's no one in this list.</p>
        `;return O`
        <ul>
            ${_.map((f)=>{return O`<li key=${f.state_key}>${f.state_key}</li>`})}
        </ul>
    `},Cf=function({list:_}){if(_.length===0)return O`
            <p>There's no media in this list.</p>
        `;return O`
        <ul>
            ${_.map((f)=>{return O`<li key=${f}>${f}</li>`})}
        </ul>
    `},gf=function(_){if(!Array.isArray(_))return null;const f=new Map(Object.entries({join:[],invite:[],knock:[],leave:[],ban:[]}));for(let c of _){if(!f.has(c.content.membership))f.set(c.content.membership,[]);f.get(c.content.membership).push(c)}return f},ic=function({identity:_,roomId:f}){const[c,p]=z(!1),[l,$]=z(null);C(()=>{$(null)},[f]);const h=J(async(x)=>{x.preventDefault(),x.stopPropagation(),p(!0);try{const H=await K_(_,f);$([...H.chunk])}catch(H){alert(H)}finally{p(!1)}},[_,f]),F=N(()=>gf(l),[l]);return O`
        <form onsubmit=${h}><fieldset disabled=${c}>
            <p>Doesn't support pagination yet. Up to 60.000 users seems safe.</p>
            <button type="submit">Get members</button>
        </fieldset></form>
        ${F&&O`
            <details open>
                <summary><h3>Joined (${F.get("join").length})</h3></summary>
                <${f_} members=${F.get("join")} />
            </details>
            <details open>
                <summary><h3>Invited (${F.get("invite").length})</h3></summary>
                <${f_} members=${F.get("invite")} />
            </details>
            <details>
                <summary><h3>Knocking (${F.get("knock").length})</h3></summary>
                <${f_} members=${F.get("knock")} />
            </details>
            <details>
                <summary><h3>Left (${F.get("leave").length})</h3></summary>
                <${f_} members=${F.get("leave")} />
            </details>
            <details>
                <summary><h3>Banned (${F.get("ban").length})</h3></summary>
                <${f_} members=${F.get("ban")} />
            </details>
        `}
    `},sc=function({identity:_,roomId:f}){const[c,p]=z(!1),[l,$]=z(null),h=J(async(F)=>{F.preventDefault(),F.stopPropagation(),p(!0);try{const x=await Yf(_,f);$(x.chunk)}catch(x){alert(x)}finally{p(!1)}},[_,f]);return O`
        <form onsubmit=${h}><fieldset disabled=${c}>
            <button type="submit">Get media</button>
        </fieldset></form>
        ${l&&O`
            <details open>
                <summary><h3>Local (${l.local.length})</h3></summary>
                <${Cf} list=${l.local} />
            </details>
            <details open>
                <summary><h3>Remote (${l.remote.length})</h3></summary>
                <${Cf} list=${l.remote} />
            </details>
        `}
    `},dc=function({render:_,identityName:f}){const{identities:c}=b(v),p=c.find((l)=>l.name===f);if(!p)return O`
            <${T}
                backUrl="#"
            >Invalid identity</>
            <p>No such identity. Please go back and add an identity with the name ${f}.</p>
        `;return _(p)},tc=function({identity:_,roomId:f}){const[c,p]=z(null),l=J(({userIds:h})=>{p(h)},[]),$=J(async(h)=>{return z_(_,f,h)},[_,f]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}`}
        >Bulk Invite</>
        <main>
            <h2>${f}</h2>
            ${c===null?O`
                <${i} actionLabel="Invite" onSubmit=${l} />
            `:O`
                <${s} action=${$} items=${c} />
            `}
        </main>
        <${P} />
    `},ec=function({identity:_,roomId:f}){const[c,p]=z(null),l=J(({userIds:h})=>{p(h)},[]),$=J(async(h)=>{return N_(_,f,h)},[_,f]);return O`
        <${T}
            backUrl=${`#/${encodeURIComponent(_.name)}/${encodeURIComponent(f)}`}
        >Bulk Kick</>
        <main>
            <h2>${f}</h2>
            ${c===null?O`
                <${i} actionLabel="Kick" onSubmit=${l} />
            `:O`
                <${s} action=${$} items=${c} />
            `}
        </main>
        <${P} />
    `},_p=function(){const[_,f]=z(location.hash.slice(1));C(()=>{const F=()=>{f(location.hash.slice(1))};return window.addEventListener("hashchange",F),()=>{window.removeEventListener("hashchange",F)}},[]);const c=_.match(fp),p=_.match(cp),l=c?.groups.identityName&&decodeURIComponent(c.groups.identityName)||p?.groups.identityName&&decodeURIComponent(p.groups.identityName),$=p?.groups.roomId&&decodeURIComponent(p.groups.roomId);let h;if(_==="about")h=O`<${w_} />`;else if(_==="settings")h=O`<${vc} />`;else if(c)h=O`<${Zc} identityName=${l} />`;else if(p)h=O`
            <${dc}
                identityName=${l}
                render=${(F)=>{if(p){if(p.groups.roomId==="synapse-admin")return O`<${Pf}
                                identity=${F}
                            />`;else if(p.groups.roomId==="contact-list")return O`<${Zf}
                                identity=${F}
                            />`;else if(p.groups.roomId==="overview")return O`<${kf}
                            identity=${F}
                            />`;else if(p.groups.roomId==="polychat")return O`<${Uf}
                            identity=${F}
                            />`;else if(p.groups.roomId==="room-list")return O`<${Tf}
                                identity=${F}
                            />`;else if(p.groups.subpage==="yaml")return O`<${Nf}
                                identity=${F}
                                roomId=${$}
                            />`;else if(p.groups.subpage==="invite")return O`<${tc}
                                identity=${F}
                                roomId=${$}
                            />`;else if(p.groups.subpage==="mass-joiner")return O`<${Qf}
                                identity=${F}
                                roomId=${$}
                            />`;else if(p.groups.subpage==="kick")return O`<${ec}
                                identity=${F}
                                roomId=${$}
                            />`;else if(p.groups.subpage==="space-management")return O`<${jf}
                                identity=${F}
                                roomId=${$}
                            />`}return O`<${Pc}
                        identity=${F}
                        roomId=${$}
                    />`}}
            />
        `;else h=O`
            <${Mc} />
            <${P} />
        `;return O`
        <${kc}>
            <${Uc}>
                ${h}
            </>
        </>
        <${lf} />
    `},Af=500,Lf=[];try{const _=JSON.parse(localStorage.getItem("identities"));if(!Array.isArray(_))throw Error(`Expected an array, got ${typeof _}`);Lf=_.map((f)=>({...f,rememberLogin:!0}))}catch(_){console.warn("No identities loaded from localStorage.",_)}var Bf=G_({isShortened:!1,requests:[]}),v=G_({externalMatrixUrl:"https://matrix.to/#/",identities:[],showNetworkLog:!0}),Hc={},fp=/^identity(?:\/(?<identityName>[^/]*))?$/,cp=/^\/(?<identityName>[^/]*)(?:\/(?<roomId>[^/]*)(?:\/(?<subpage>.*))?)?$/;t_(O`<${_p} />`,document.body);export{v as Settings,P as NetworkLog};
