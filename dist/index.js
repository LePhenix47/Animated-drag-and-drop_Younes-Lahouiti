(()=>{"use strict";function n(n,e){return getComputedStyle(e).getPropertyValue(n)}function e(n){return Number(n.replaceAll(/%|px|em|rem/g,""))}function t(n,e,t){const r=Math.max(e,n);return Math.min(r,t)}function r(n,e){const t=new CustomEvent(n);e.dispatchEvent(t)}const o={isPressing:!1,pressedElement:null,initialXAnchor:0,initialYAnchor:0,previousX:NaN,previousY:NaN},a=document.createElement("template");a.innerHTML='\n  <style>\n    \n/* \n    Hides the element and all its descendants from view\n */\n.hide {\n    display: none !important;\n}\n\n/* \n    Hides the element from view except for screen readers \n    \n    - Good for accessibilty and by consequence SEO\n*/\n.screen-readers-only {\n    /*    \n    Positions the element off the screen \n    */ \n    clip: rect(0 0 0 0);\n    clip-path: inset(50%);\n\n    /*    \n    Sets the dimensions of the element to 1×1 px \n    */ \n    height: 1px;\n    width: 1px;\n\n    /*    \n    Hides any content that overflows the element \n    */ \n    overflow: hidden;\n\n    /*    \n    Positions the element absolutely \n    */ \n    position: absolute;\n\n    /*    \n    Prevents line breaks in the element \n    */ \n    white-space: nowrap;\n}\n\n/* \n    Disables pointer (click on desktop and tap on mobile) events for the element and its descendants \n*/\n.no-pointer-events {\n    pointer-events: none;\n}\n\n\n    \n@import url(https://fonts.googleapis.com/css2?family=Roboto:wght@100;400;500;700&display=swap);\n\n@layer web-component-reset {\n  @media(prefers-reduced-motion:reduce) {\n      *, :after, :before {\n          animation: none !important;\n          transition: none !important\n      }\n  }\n\n  *, :after, :before {\n      box-sizing: border-box;\n      margin: 0;\n      padding: 0\n  }\n  \n  ::-moz-selection {\n      -webkit-text-stroke: transparent;\n      background-color: var(--selection-bg-color);\n      color: var(--selection-color)\n  }\n  \n  ::selection {\n      -webkit-text-stroke: transparent;\n      background-color: var(--selection-bg-color);\n      color: var(--selection-color)\n  }\n  \n  html {\n      color-scheme: dark light;\n      scroll-behavior: smooth\n  }\n  \n  body {\n      background-color: var(--bg-primary);\n      color: var(--color-primary);\n      min-height: 100vh;\n      overflow-x: hidden;\n      transition: background-color .65s ease-in-out, color .35s ease-in-out\n  }\n  \n  :is(ul, ol) {\n      list-style-type: none\n  }\n  \n  button {\n      background-color: transparent;\n      border-color: transparent;\n      color: inherit;\n      font-family: inherit\n  }\n  \n  button:hover {\n      cursor: pointer\n  }\n  \n  button:hover:disabled {\n      cursor: not-allowed\n  }\n  \n  input {\n      border-color: transparent;\n      font-family: inherit;\n      outline-color: transparent\n  }\n  \n  input:hover {\n      cursor: pointer\n  }\n  \n  input:focus {\n      border-color: transparent;\n      outline: transparent\n  }\n  \n  input:disabled {\n      cursor: not-allowed\n  }\n  \n  textarea {\n      font-family: inherit\n  }\n  \n  textarea, textarea:focus {\n      border-color: transparent\n  }\n  \n  textarea:focus {\n      outline: transparent\n  }\n  \n  a {\n      color: inherit;\n      text-decoration: none\n  }\n  \n  a:visited {\n      color: currentColor\n  }\n  \n  label:hover {\n      cursor: pointer\n  }\n  \n  fieldset {\n      border-color: transparent\n  }\n  \n  legend {\n      position: static\n  }\n  \n  dialog {\n      inset: 50%;\n      margin: 0;\n      padding: 0;\n      position: fixed;\n      translate: -50% -50%;\n      z-index: 0\n  }\n  \n  dialog, select {\n      border: transparent\n  }\n  \n  select {\n      font-family: inherit\n  }\n  \n  select:hover {\n      cursor: pointer\n  }\n  \n  option {\n      font-family: inherit\n  }\n  \n  :is(p, h1, h2, h3, h4, h5, h6, span):empty {\n      display: none !important\n  }\n  input[type=text]:hover {\n    cursor: text;\n  }\n  input[type=button]:hover {\n    cursor: pointer;\n  }\n  input[type=date]:hover {\n    cursor: text;\n  }\n  input[type=datetime]:hover {\n    cursor: text;\n  }\n  input[type=datetime-local]:hover {\n    cursor: text;\n  }\n  input[type=email]:hover {\n    cursor: text;\n  }\n  input[type=month]:hover {\n    cursor: text;\n  }\n  input[type=week]:hover {\n    cursor: text;\n  }\n  input[type=password]:hover {\n    cursor: text;\n  }\n  input[type=tel]:hover {\n    cursor: text;\n  }\n  input[type=time]:hover {\n    cursor: text;\n  }\n  input[type=url]:hover {\n    cursor: text;\n  }\n  input[type=submit]:hover {\n    cursor: pointer;\n  }\n  input[type=reset]:hover {\n    cursor: pointer;\n  }\n  input[type=image]:hover {\n    cursor: pointer;\n  }\n  input[type=hidden]:hover {\n    cursor: pointer;\n  }\n  input[type=file] {\n    --file-selector-display: initial;\n    --file-selector-width: 80px;\n    --file-selector-height: 21px;\n  }\n  input[type=file]:hover {\n    cursor: pointer;\n  }\n  input[type=file]::file-selector-button {\n    display: var(--file-selector-display);\n    height: var(--file-selector-height);\n    width: var(--file-selector-width);\n  }\n  input[type=color] {\n    background-color: transparent;\n    --color-swatch-display: inline-block;\n    --color-swatch-height: 100%;\n    --color-swatch-border-width: 1px;\n    --color-swatch-border-color: currentColor;\n  }\n  input[type=color]:hover {\n    cursor: pointer;\n  }\n  input[type=color]::-moz-color-swatch {\n    display: var(--color-swatch-display);\n    height: var(--color-swatch-height);\n    border: var(--color-swatch-border-width) solid var(--color-swatch-border-color);\n  }\n  input[type=color]::-webkit-color-swatch {\n    display: var(--color-swatch-display);\n    height: var(--color-swatch-height);\n    border: var(--color-swatch-border-width) solid var(--color-swatch-border-color);\n  }\n  input[type=search] {\n    --cancel-button-display: initial;\n    --results-button-display: initial;\n  }\n  input[type=search]:hover {\n    cursor: text;\n  }\n  input[type=search]::-webkit-search-cancel-button {\n    display: var(--cancel-button-display);\n  }\n  input[type=search]::-webkit-search-results-button {\n    display: var(--results-button-display);\n  }\n  input[type=number] {\n    --inner-spin-appearance: auto;\n    --outer-spin-appearance: auto;\n    --moz-appearance: initial;\n    /*\n        Ignore the warning, this is to reset the input on Firefox\n        */\n    -moz-appearance: var(--moz-appearance);\n  }\n  input[type=number]:hover {\n    cursor: text;\n  }\n  input[type=number]::-webkit-inner-spin-button {\n    appearance: var(--inner-spin-appearance);\n  }\n  input[type=number]::-webkit-outer-spin-button {\n    appearance: var(--outer-spin-appearance);\n  }\n  input[type=range] {\n    border-radius: var(--thumb-border-radius);\n    --track-width: 160px;\n    --track-height: 20px;\n    --track-bg: #e9e9ed;\n    --track-appearance: none;\n    background-color: var(--track-bg);\n    appearance: var(--track-appearance);\n    overflow: hidden;\n    --thumb-appearance: none;\n    --thumb-bg: #484851;\n    --thumb-border-color: white;\n    --thumb-border-width: 0px;\n    --thumb-border-radius: 100vmax;\n    --thumb-width: 15px;\n    --thumb-height: 15px;\n    --inner-track-size: calc(var(--track-width));\n    --inner-track-offset: calc(\n      -1 * var(--track-width) - var(--thumb-width) / 2\n    );\n    --inner-track-bg: #2374ff;\n  }\n  input[type=range]:hover {\n    cursor: grab;\n  }\n  input[type=range]:active {\n    cursor: grabbing;\n  }\n  input[type=range]::-webkit-slider-runnable-track {\n    background-color: var(--track-bg);\n    width: var(--track-width);\n    height: var(--track-bg);\n  }\n  input[type=range]::-moz-range-track {\n    background-color: var(--track-bg);\n    width: var(--track-width);\n    height: var(--track-bg);\n  }\n  input[type=range]::-webkit-slider-thumb {\n    appearance: var(--thumb-appearance);\n    -webkit-appearance: var(--thumb-appearance);\n    background-color: var(--thumb-bg);\n    color: var(--thumb-bg);\n    border: var(--thumb-border-width) solid var(--thumb-border-color);\n    border-radius: var(--thumb-border-radius);\n    width: var(--thumb-width);\n    height: var(--thumb-height);\n    box-shadow: var(--inner-track-offset) 0 0 var(--inner-track-size) var(--inner-track-bg);\n  }\n  input[type=range]::-moz-range-thumb {\n    appearance: var(--thumb-appearance) !important;\n    background-color: var(--thumb-bg);\n    border: var(--thumb-border-width) solid var(--thumb-border-color);\n    border-radius: var(--thumb-border-radius);\n    width: var(--thumb-width);\n    height: var(--thumb-height);\n    box-shadow: var(--inner-track-offset) 0 0 var(--inner-track-size) var(--inner-track-bg);\n  }\n}\n\n    \n:host {\n    --bg-primary: rgb(255, 255, 255);\n    --bg-secondary: #f0efef;\n    --bg-tertiary: #676767;\n\n    --semi-transparent-bg: rgba(255, 255, 255, 50%);\n\n    --color-primary: black;\n    --color-secondary: gray;\n\n    --scrollbar-track-bg-color: white;\n\n    --disabled-button-bg: #afafaf;\n\n    --scrollbar-thumb-bg-color: #545454;\n    --scrollbar-thumb-bg-color--hover: #757575;\n    --scrollbar-thumb-bg-color--active: #b0b0b0;\n\n    --selection-bg-color: hwb(240 0% 0%);\n    --selection-color: white;\n}\n\n::backdrop {\n    --backdrop-bg-color: rgba(255, 255, 255, 0.5);\n\n    --scrollbar-track-bg-color: white;\n\n    --scrollbar-thumb-bg-color: #545454;\n    --scrollbar-thumb-bg-color--hover: #757575;\n    --scrollbar-thumb-bg-color--active: #b0b0b0;\n}\n\n    \n@media (prefers-color-scheme: dark) {\n    :host {\n        --bg-primary: black;\n        --bg-secondary: #232323;\n        --bg-tertiary: #7a7a7a;\n\n        --color-primary: white;\n\n        --semi-transparent-bg: rgba(0, 0, 0, 50%);\n\n        --scrollbar-track-bg-color: black;\n        --scrollbar-thumb-bg-color: #ababab;\n        --scrollbar-thumb-bg-color--hover: #8a8a8a;\n        --scrollbar-thumb-bg-color--active: #4f4f4f;\n\n        --selection-bg: #838383;\n        --selection-color: white;\n\n        --selection-bg-color: orange;\n        --selection-color: black;\n    }\n\n\n    ::backdrop {\n        --backdrop-bg-color: rgba(0, 0, 0, 0.5);\n\n        --scrollbar-track-bg-color: black;\n\n        --scrollbar-thumb-bg-color: #ababab;\n        --scrollbar-thumb-bg-color--hover: #8a8a8a;\n        --scrollbar-thumb-bg-color--active: #4f4f4f;\n    }\n}\n\n\n    /* Actual CSS style for the web component*/\n    \n user-component{\n  isolation: isolate;\n  /* Other CSS styles here */\n }\n\n  </style>\n  \n  \n <figure>\n  <slot name="title" />\n  <slot name="image" />\n </figure>\n\n';class i extends HTMLElement{constructor(){super();const n=this.attachShadow({mode:"open"}),e=a.content.cloneNode(!0);n.appendChild(e)}static get observedAttributes(){return[]}connectedCallback(){}disconnectedCallback(){}attributeChangedCallback(n,e,t){n}}customElements.define("web-component",i);const{log:s}=console;let c=[];const l=document.querySelector("[data-js=container]"),p=e(n("--_cards-in-container",l));function d(t){if(console.log("handlePointerLeave"),t.preventDefault(),o.isPressing=!1,!o.pressedElement)return;const r=o.pressedElement.parentElement?.hasAttribute("draggable");r&&function(){const{parentElement:t}=o.pressedElement;t.classList.remove("dragging");const r=u(t),a=c.indexOf(r),i=e(n("--_height",t)),s=e(n("gap",l));r.y=a*(i+s),t.style.setProperty("--_y",`${r.y}px`),console.table(c)}(),o.pressedElement=null}function u(n){return c.find((e=>e.id===n.getAttribute("data-draggable-id")))||null}function b(t){const r=o.pressedElement?.parentElement;if(!r)return;const a=u(r);if(!a)return;const i=e(n("--_height",a.element)),p=a.y+i/2,d=function(t,r){let o=null,a=1/0;for(const i of r){const r=e(n("--_height",i.element));if(Number.isNaN(r)){console.error("Invalid candidateItemHeight:",r);continue}const s=i.y+r/2;if(Number.isNaN(s)){console.error("Invalid candidateCenterY:",s);continue}const c=Math.abs(t-s);Number.isNaN(c)?console.error("Invalid distance:",c):c<a&&(a=c,o=i)}return o}(p,t);if(!d)return;const b=d.element.offsetHeight/2,h=d.y+d.element.offsetHeight/2,g=Math.abs(p-h);s({distance:g,candidateCenterY:h,threshold:b,"closestItem.y":d.y}),g<=b&&function(t,r){const o=t.element,a=c.indexOf(t),i=c.indexOf(r);[c[a],c[i]]=[c[i],c[a]];const s=e(n("gap",l)),p=e(n("--_height",o));for(let n=0;n<c.length;n++){const e=c[n],t=n*(p+s);e.y=t,e.element.style.setProperty("--_y",`${t}px`)}console.log("Swapped items:",{draggedItem:t,targetItem:r})}(a,d)}!function(t,r){const o=document.querySelector("[data-js=sample]"),a=a=>{const i=e(n("gap",t)),s=e(n("--_height",o));return`\n  <li class="draggable" draggable style="--_y: ${a*(a-1===r?s:i+s)}px;" data-draggable-id="draggable-${a+1}">\n    <button class="draggable__handle">\n      <span class="draggable__handle-icon no-pointer-events square-icon" aria-label="Draggable handle icon">\n        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">\n  <path\n    d="M10 13a1 1 0 100-2 1 1 0 000 2zm-4 0a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zm3 1a1 1 0 100-2 1 1 0 000 2zm1-5a1 1 0 11-2 0 1 1 0 012 0zM6 5a1 1 0 100-2 1 1 0 000 2z">\n  </path>\n</svg>\n      </span>\n    </button>\n  </li>\n  `};let i="";for(let n=0;n<r;n++)i+=a(n);t.innerHTML=i,o.remove();const s=t.querySelectorAll(".draggable");for(let n=0;n<s.length;n++){const e=s[n],{x:t,y:r}=e.getBoundingClientRect(),o={id:`draggable-${n+1}`,x:t,y:r,element:e};c.push(o)}console.log("Draggable items initialized:",c)}(l,p),l.addEventListener("pointerup",d),l.addEventListener("pointerdown",(function(n){n.preventDefault(),o.isPressing=function(n){return"mouse"===n.pointerType&&0===n.button}(n)||function(n){return"touch"===n.pointerType}(n);const e=n.target;o.pressedElement=e;if(!e?.parentElement?.hasAttribute?.("draggable"))return;e.parentElement.classList.add("dragging");const r=e.getBoundingClientRect(),a=l.getBoundingClientRect(),i=n.pageX+a.x-r.x,c=n.pageY+a.y-r.y;o.initialXAnchor=t(0,i,a.width),o.initialYAnchor=t(0,c,a.height),s("Pointer info down ↓:",o)})),l.addEventListener("pointermove",(function(n){const{pressedElement:e}=o;if(!o.isPressing||!e?.classList?.contains?.("draggable__handle"))return;o.previousX||(o.previousX=n.pageX);o.previousY||(o.previousY=n.pageY);const a=n.pageY>o.previousY,i=n.pageY<o.previousY;a?r("custom:draggable-scroll-down",l):i?r("custom:draggable-scroll-up",l):console.log("No Y direction change while dragging");o.previousX=n.pageX,o.previousY=n.pageY;const s=l.getBoundingClientRect(),c=[{axisName:"y",computedOffset:t(0,n.pageY-o.initialYAnchor,s.height)}];for(const n of c){const{axisName:t,computedOffset:r}=n,{parentElement:o}=e;o.style.setProperty(`--_${t}`,`${r}px`);const a=u(o);a&&(a.y=r)}})),l.addEventListener("pointercancel",(function(n){s("Pointer cancel",n)})),l.addEventListener("pointerleave",d),l.addEventListener("custom:draggable-scroll-up",(()=>{const n=o.pressedElement?.parentElement;if(!n)return;const e=c.findIndex((e=>e.id===n.getAttribute("data-draggable-id")));if(0===e)return;b(c.slice(0,e))})),l.addEventListener("custom:draggable-scroll-down",(()=>{const n=o.pressedElement?.parentElement;if(!n)return;const e=c.findIndex((e=>e.id===n.getAttribute("data-draggable-id")));if(e>c.length-1)return;b(c.slice(e+1))}))})();