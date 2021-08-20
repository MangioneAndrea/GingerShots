
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* eslint-disable no-param-reassign */

    /**
     * Options for customizing ripples
     */
    const defaults = {
      color: 'currentColor',
      class: '',
      opacity: 0.1,
      centered: false,
      spreadingDuration: '.4s',
      spreadingDelay: '0s',
      spreadingTimingFunction: 'linear',
      clearingDuration: '1s',
      clearingDelay: '0s',
      clearingTimingFunction: 'ease-in-out',
    };

    /**
     * Creates a ripple element but does not destroy it (use RippleStop for that)
     *
     * @param {Event} e
     * @param {*} options
     * @returns Ripple element
     */
    function RippleStart(e, options = {}) {
      e.stopImmediatePropagation();
      const opts = { ...defaults, ...options };

      const isTouchEvent = e.touches ? !!e.touches[0] : false;
      // Parent element
      const target = isTouchEvent ? e.touches[0].currentTarget : e.currentTarget;

      // Create ripple
      const ripple = document.createElement('div');
      const rippleStyle = ripple.style;

      // Adding default stuff
      ripple.className = `material-ripple ${opts.class}`;
      rippleStyle.position = 'absolute';
      rippleStyle.color = 'inherit';
      rippleStyle.borderRadius = '50%';
      rippleStyle.pointerEvents = 'none';
      rippleStyle.width = '100px';
      rippleStyle.height = '100px';
      rippleStyle.marginTop = '-50px';
      rippleStyle.marginLeft = '-50px';
      target.appendChild(ripple);
      rippleStyle.opacity = opts.opacity;
      rippleStyle.transition = `transform ${opts.spreadingDuration} ${opts.spreadingTimingFunction} ${opts.spreadingDelay},opacity ${opts.clearingDuration} ${opts.clearingTimingFunction} ${opts.clearingDelay}`;
      rippleStyle.transform = 'scale(0) translate(0,0)';
      rippleStyle.background = opts.color;

      // Positioning ripple
      const targetRect = target.getBoundingClientRect();
      if (opts.centered) {
        rippleStyle.top = `${targetRect.height / 2}px`;
        rippleStyle.left = `${targetRect.width / 2}px`;
      } else {
        const distY = isTouchEvent ? e.touches[0].clientY : e.clientY;
        const distX = isTouchEvent ? e.touches[0].clientX : e.clientX;
        rippleStyle.top = `${distY - targetRect.top}px`;
        rippleStyle.left = `${distX - targetRect.left}px`;
      }

      // Enlarge ripple
      rippleStyle.transform = `scale(${
    Math.max(targetRect.width, targetRect.height) * 0.02
  }) translate(0,0)`;
      return ripple;
    }

    /**
     * Destroys the ripple, slowly fading it out.
     *
     * @param {Element} ripple
     */
    function RippleStop(ripple) {
      if (ripple) {
        ripple.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'opacity') ripple.remove();
        });
        ripple.style.opacity = 0;
      }
    }

    /**
     * @param node {Element}
     */
    var Ripple = (node, _options = {}) => {
      let options = _options;
      let destroyed = false;
      let ripple;
      let keyboardActive = false;
      const handleStart = (e) => {
        ripple = RippleStart(e, options);
      };
      const handleStop = () => RippleStop(ripple);
      const handleKeyboardStart = (e) => {
        if (!keyboardActive && (e.keyCode === 13 || e.keyCode === 32)) {
          ripple = RippleStart(e, { ...options, centered: true });
          keyboardActive = true;
        }
      };
      const handleKeyboardStop = () => {
        keyboardActive = false;
        handleStop();
      };

      function setup() {
        node.classList.add('s-ripple-container');
        node.addEventListener('pointerdown', handleStart);
        node.addEventListener('pointerup', handleStop);
        node.addEventListener('pointerleave', handleStop);
        node.addEventListener('keydown', handleKeyboardStart);
        node.addEventListener('keyup', handleKeyboardStop);
        destroyed = false;
      }

      function destroy() {
        node.classList.remove('s-ripple-container');
        node.removeEventListener('pointerdown', handleStart);
        node.removeEventListener('pointerup', handleStop);
        node.removeEventListener('pointerleave', handleStop);
        node.removeEventListener('keydown', handleKeyboardStart);
        node.removeEventListener('keyup', handleKeyboardStop);
        destroyed = true;
      }

      if (options) setup();

      return {
        update(newOptions) {
          options = newOptions;
          if (options && destroyed) setup();
          else if (!(options || destroyed)) destroy();
        },
        destroy,
      };
    };

    /* node_modules\svelte-materialify\dist\components\MaterialApp\MaterialAppMin.svelte generated by Svelte v3.37.0 */

    const file$d = "node_modules\\svelte-materialify\\dist\\components\\MaterialApp\\MaterialAppMin.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-app theme--" + /*theme*/ ctx[0]);
    			add_location(div, file$d, 2535, 0, 66583);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1 && div_class_value !== (div_class_value = "s-app theme--" + /*theme*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MaterialAppMin", slots, ['default']);
    	let { theme = "light" } = $$props;
    	const writable_props = ["theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MaterialAppMin> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ theme });

    	$$self.$inject_state = $$props => {
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class MaterialAppMin extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MaterialAppMin",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get theme() {
    		throw new Error("<MaterialAppMin>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<MaterialAppMin>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function format$1(input) {
      if (typeof input === 'number') return `${input}px`;
      return input;
    }

    /**
     * @param node {Element}
     * @param styles {Object}
     */
    var Style = (node, _styles) => {
      let styles = _styles;
      Object.entries(styles).forEach(([key, value]) => {
        if (value) node.style.setProperty(`--s-${key}`, format$1(value));
      });

      return {
        update(newStyles) {
          Object.entries(newStyles).forEach(([key, value]) => {
            if (value) {
              node.style.setProperty(`--s-${key}`, format$1(value));
              delete styles[key];
            }
          });

          Object.keys(styles).forEach((name) => node.style.removeProperty(`--s-${name}`));

          styles = newStyles;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Icon\Icon.svelte generated by Svelte v3.37.0 */
    const file$c = "node_modules\\svelte-materialify\\dist\\components\\Icon\\Icon.svelte";

    // (67:2) {#if path}
    function create_if_block$3(ctx) {
    	let svg;
    	let path_1;
    	let svg_viewBox_value;
    	let if_block = /*label*/ ctx[10] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path_1 = svg_element("path");
    			if (if_block) if_block.c();
    			attr_dev(path_1, "d", /*path*/ ctx[9]);
    			add_location(path_1, file$c, 72, 6, 1723);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", /*width*/ ctx[0]);
    			attr_dev(svg, "height", /*height*/ ctx[1]);
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + /*viewWidth*/ ctx[4] + " " + /*viewHeight*/ ctx[5]);
    			add_location(svg, file$c, 67, 4, 1591);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path_1);
    			if (if_block) if_block.m(path_1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*label*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(path_1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*path*/ 512) {
    				attr_dev(path_1, "d", /*path*/ ctx[9]);
    			}

    			if (dirty & /*width*/ 1) {
    				attr_dev(svg, "width", /*width*/ ctx[0]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(svg, "height", /*height*/ ctx[1]);
    			}

    			if (dirty & /*viewWidth, viewHeight*/ 48 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + /*viewWidth*/ ctx[4] + " " + /*viewHeight*/ ctx[5])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(67:2) {#if path}",
    		ctx
    	});

    	return block;
    }

    // (74:8) {#if label}
    function create_if_block_1$1(ctx) {
    	let title;
    	let t;

    	const block = {
    		c: function create() {
    			title = svg_element("title");
    			t = text(/*label*/ ctx[10]);
    			add_location(title, file$c, 74, 10, 1771);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			append_dev(title, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1024) set_data_dev(t, /*label*/ ctx[10]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(74:8) {#if label}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let i;
    	let t;
    	let i_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*path*/ ctx[9] && create_if_block$3(ctx);
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "s-icon " + /*klass*/ ctx[2]);
    			attr_dev(i, "aria-label", /*label*/ ctx[10]);
    			attr_dev(i, "aria-disabled", /*disabled*/ ctx[8]);
    			attr_dev(i, "style", /*style*/ ctx[11]);
    			toggle_class(i, "spin", /*spin*/ ctx[7]);
    			toggle_class(i, "disabled", /*disabled*/ ctx[8]);
    			add_location(i, file$c, 57, 0, 1359);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    			if (if_block) if_block.m(i, null);
    			append_dev(i, t);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, i, {
    					"icon-size": /*size*/ ctx[3],
    					"icon-rotate": `${/*rotate*/ ctx[6]}deg`
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*path*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(i, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 4 && i_class_value !== (i_class_value = "s-icon " + /*klass*/ ctx[2])) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*label*/ 1024) {
    				attr_dev(i, "aria-label", /*label*/ ctx[10]);
    			}

    			if (!current || dirty & /*disabled*/ 256) {
    				attr_dev(i, "aria-disabled", /*disabled*/ ctx[8]);
    			}

    			if (!current || dirty & /*style*/ 2048) {
    				attr_dev(i, "style", /*style*/ ctx[11]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*size, rotate*/ 72) Style_action.update.call(null, {
    				"icon-size": /*size*/ ctx[3],
    				"icon-rotate": `${/*rotate*/ ctx[6]}deg`
    			});

    			if (dirty & /*klass, spin*/ 132) {
    				toggle_class(i, "spin", /*spin*/ ctx[7]);
    			}

    			if (dirty & /*klass, disabled*/ 260) {
    				toggle_class(i, "disabled", /*disabled*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(i);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Icon", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { size = "24px" } = $$props;
    	let { width = size } = $$props;
    	let { height = size } = $$props;
    	let { viewWidth = "24" } = $$props;
    	let { viewHeight = "24" } = $$props;
    	let { rotate = 0 } = $$props;
    	let { spin = false } = $$props;
    	let { disabled = false } = $$props;
    	let { path = null } = $$props;
    	let { label = null } = $$props;
    	let { style = null } = $$props;

    	const writable_props = [
    		"class",
    		"size",
    		"width",
    		"height",
    		"viewWidth",
    		"viewHeight",
    		"rotate",
    		"spin",
    		"disabled",
    		"path",
    		"label",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(2, klass = $$props.class);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("viewWidth" in $$props) $$invalidate(4, viewWidth = $$props.viewWidth);
    		if ("viewHeight" in $$props) $$invalidate(5, viewHeight = $$props.viewHeight);
    		if ("rotate" in $$props) $$invalidate(6, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("label" in $$props) $$invalidate(10, label = $$props.label);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		size,
    		width,
    		height,
    		viewWidth,
    		viewHeight,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(2, klass = $$props.klass);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("viewWidth" in $$props) $$invalidate(4, viewWidth = $$props.viewWidth);
    		if ("viewHeight" in $$props) $$invalidate(5, viewHeight = $$props.viewHeight);
    		if ("rotate" in $$props) $$invalidate(6, rotate = $$props.rotate);
    		if ("spin" in $$props) $$invalidate(7, spin = $$props.spin);
    		if ("disabled" in $$props) $$invalidate(8, disabled = $$props.disabled);
    		if ("path" in $$props) $$invalidate(9, path = $$props.path);
    		if ("label" in $$props) $$invalidate(10, label = $$props.label);
    		if ("style" in $$props) $$invalidate(11, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*size*/ 8) {
    			{
    				$$invalidate(0, width = size);
    				$$invalidate(1, height = size);
    			}
    		}
    	};

    	return [
    		width,
    		height,
    		klass,
    		size,
    		viewWidth,
    		viewHeight,
    		rotate,
    		spin,
    		disabled,
    		path,
    		label,
    		style,
    		$$scope,
    		slots
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			class: 2,
    			size: 3,
    			width: 0,
    			height: 1,
    			viewWidth: 4,
    			viewHeight: 5,
    			rotate: 6,
    			spin: 7,
    			disabled: 8,
    			path: 9,
    			label: 10,
    			style: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewWidth() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewWidth(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewHeight() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewHeight(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rotate() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rotate(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const filter = (classes) => classes.filter((x) => !!x);
    const format = (classes) => classes.split(' ').filter((x) => !!x);

    /**
     * @param node {Element}
     * @param classes {Array<string>}
     */
    var Class = (node, _classes) => {
      let classes = _classes;
      node.classList.add(...format(filter(classes).join(' ')));
      return {
        update(_newClasses) {
          const newClasses = _newClasses;
          newClasses.forEach((klass, i) => {
            if (klass) node.classList.add(...format(klass));
            else if (classes[i]) node.classList.remove(...format(classes[i]));
          });
          classes = newClasses;
        },
      };
    };

    /* node_modules\svelte-materialify\dist\components\Button\Button.svelte generated by Svelte v3.37.0 */
    const file$b = "node_modules\\svelte-materialify\\dist\\components\\Button\\Button.svelte";

    function create_fragment$c(ctx) {
    	let button_1;
    	let span;
    	let button_1_class_value;
    	let Class_action;
    	let Ripple_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	let button_1_levels = [
    		{
    			class: button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1]
    		},
    		{ type: /*type*/ ctx[14] },
    		{ style: /*style*/ ctx[16] },
    		{ disabled: /*disabled*/ ctx[11] },
    		{ "aria-disabled": /*disabled*/ ctx[11] },
    		/*$$restProps*/ ctx[17]
    	];

    	let button_1_data = {};

    	for (let i = 0; i < button_1_levels.length; i += 1) {
    		button_1_data = assign(button_1_data, button_1_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button_1 = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "s-btn__content");
    			add_location(span, file$b, 232, 2, 5893);
    			set_attributes(button_1, button_1_data);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    			add_location(button_1, file$b, 212, 0, 5443);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);
    			append_dev(button_1, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			/*button_1_binding*/ ctx[21](button_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button_1, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]])),
    					action_destroyer(Ripple_action = Ripple.call(null, button_1, /*ripple*/ ctx[15])),
    					listen_dev(button_1, "click", /*click_handler*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, null, null);
    				}
    			}

    			set_attributes(button_1, button_1_data = get_spread_update(button_1_levels, [
    				(!current || dirty & /*size, klass*/ 34 && button_1_class_value !== (button_1_class_value = "s-btn size-" + /*size*/ ctx[5] + " " + /*klass*/ ctx[1])) && { class: button_1_class_value },
    				(!current || dirty & /*type*/ 16384) && { type: /*type*/ ctx[14] },
    				(!current || dirty & /*style*/ 65536) && { style: /*style*/ ctx[16] },
    				(!current || dirty & /*disabled*/ 2048) && { disabled: /*disabled*/ ctx[11] },
    				(!current || dirty & /*disabled*/ 2048) && { "aria-disabled": /*disabled*/ ctx[11] },
    				dirty & /*$$restProps*/ 131072 && /*$$restProps*/ ctx[17]
    			]));

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 12288) Class_action.update.call(null, [/*active*/ ctx[12] && /*activeClass*/ ctx[13]]);
    			if (Ripple_action && is_function(Ripple_action.update) && dirty & /*ripple*/ 32768) Ripple_action.update.call(null, /*ripple*/ ctx[15]);
    			toggle_class(button_1, "s-btn--fab", /*fab*/ ctx[2]);
    			toggle_class(button_1, "icon", /*icon*/ ctx[3]);
    			toggle_class(button_1, "block", /*block*/ ctx[4]);
    			toggle_class(button_1, "tile", /*tile*/ ctx[6]);
    			toggle_class(button_1, "text", /*text*/ ctx[7] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "depressed", /*depressed*/ ctx[8] || /*text*/ ctx[7] || /*disabled*/ ctx[11] || /*outlined*/ ctx[9] || /*icon*/ ctx[3]);
    			toggle_class(button_1, "outlined", /*outlined*/ ctx[9]);
    			toggle_class(button_1, "rounded", /*rounded*/ ctx[10]);
    			toggle_class(button_1, "disabled", /*disabled*/ ctx[11]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button_1);
    			if (default_slot) default_slot.d(detaching);
    			/*button_1_binding*/ ctx[21](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const omit_props_names = [
    		"class","fab","icon","block","size","tile","text","depressed","outlined","rounded","disabled","active","activeClass","type","ripple","style","button"
    	];

    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Button", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { fab = false } = $$props;
    	let { icon = false } = $$props;
    	let { block = false } = $$props;
    	let { size = "default" } = $$props;
    	let { tile = false } = $$props;
    	let { text = false } = $$props;
    	let { depressed = false } = $$props;
    	let { outlined = false } = $$props;
    	let { rounded = false } = $$props;
    	let { disabled = null } = $$props;
    	let { active = false } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { type = "button" } = $$props;
    	let { ripple = {} } = $$props;
    	let { style = null } = $$props;
    	let { button = null } = $$props;

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			button = $$value;
    			$$invalidate(0, button);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(17, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("class" in $$new_props) $$invalidate(1, klass = $$new_props.class);
    		if ("fab" in $$new_props) $$invalidate(2, fab = $$new_props.fab);
    		if ("icon" in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ("block" in $$new_props) $$invalidate(4, block = $$new_props.block);
    		if ("size" in $$new_props) $$invalidate(5, size = $$new_props.size);
    		if ("tile" in $$new_props) $$invalidate(6, tile = $$new_props.tile);
    		if ("text" in $$new_props) $$invalidate(7, text = $$new_props.text);
    		if ("depressed" in $$new_props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ("outlined" in $$new_props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ("rounded" in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("disabled" in $$new_props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ("active" in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ("activeClass" in $$new_props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ("type" in $$new_props) $$invalidate(14, type = $$new_props.type);
    		if ("ripple" in $$new_props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ("style" in $$new_props) $$invalidate(16, style = $$new_props.style);
    		if ("button" in $$new_props) $$invalidate(0, button = $$new_props.button);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Ripple,
    		Class,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		button
    	});

    	$$self.$inject_state = $$new_props => {
    		if ("klass" in $$props) $$invalidate(1, klass = $$new_props.klass);
    		if ("fab" in $$props) $$invalidate(2, fab = $$new_props.fab);
    		if ("icon" in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ("block" in $$props) $$invalidate(4, block = $$new_props.block);
    		if ("size" in $$props) $$invalidate(5, size = $$new_props.size);
    		if ("tile" in $$props) $$invalidate(6, tile = $$new_props.tile);
    		if ("text" in $$props) $$invalidate(7, text = $$new_props.text);
    		if ("depressed" in $$props) $$invalidate(8, depressed = $$new_props.depressed);
    		if ("outlined" in $$props) $$invalidate(9, outlined = $$new_props.outlined);
    		if ("rounded" in $$props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ("disabled" in $$props) $$invalidate(11, disabled = $$new_props.disabled);
    		if ("active" in $$props) $$invalidate(12, active = $$new_props.active);
    		if ("activeClass" in $$props) $$invalidate(13, activeClass = $$new_props.activeClass);
    		if ("type" in $$props) $$invalidate(14, type = $$new_props.type);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$new_props.ripple);
    		if ("style" in $$props) $$invalidate(16, style = $$new_props.style);
    		if ("button" in $$props) $$invalidate(0, button = $$new_props.button);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		button,
    		klass,
    		fab,
    		icon,
    		block,
    		size,
    		tile,
    		text,
    		depressed,
    		outlined,
    		rounded,
    		disabled,
    		active,
    		activeClass,
    		type,
    		ripple,
    		style,
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		button_1_binding
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			class: 1,
    			fab: 2,
    			icon: 3,
    			block: 4,
    			size: 5,
    			tile: 6,
    			text: 7,
    			depressed: 8,
    			outlined: 9,
    			rounded: 10,
    			disabled: 11,
    			active: 12,
    			activeClass: 13,
    			type: 14,
    			ripple: 15,
    			style: 16,
    			button: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get depressed() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set depressed(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules\svelte-materialify\dist\components\ItemGroup\ItemGroup.svelte generated by Svelte v3.37.0 */
    const file$a = "node_modules\\svelte-materialify\\dist\\components\\ItemGroup\\ItemGroup.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-item-group " + /*klass*/ ctx[0]);
    			attr_dev(div, "role", /*role*/ ctx[1]);
    			attr_dev(div, "style", /*style*/ ctx[2]);
    			add_location(div, file$a, 58, 0, 1537);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-item-group " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*role*/ 2) {
    				attr_dev(div, "role", /*role*/ ctx[1]);
    			}

    			if (!current || dirty & /*style*/ 4) {
    				attr_dev(div, "style", /*style*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const ITEM_GROUP = {};

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ItemGroup", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let { role = null } = $$props;
    	let { style = null } = $$props;
    	const dispatch = createEventDispatcher();
    	const valueStore = writable(value);
    	let startIndex = -1;

    	setContext(ITEM_GROUP, {
    		select: val => {
    			if (multiple) {
    				if (value.includes(val)) {
    					if (!mandatory || value.length > 1) {
    						value.splice(value.indexOf(val), 1);
    						$$invalidate(3, value);
    					}
    				} else if (value.length < max) $$invalidate(3, value = [...value, val]);
    			} else if (value === val) {
    				if (!mandatory) $$invalidate(3, value = null);
    			} else $$invalidate(3, value = val);
    		},
    		register: setValue => {
    			const u = valueStore.subscribe(val => {
    				setValue(multiple ? val : [val]);
    			});

    			onDestroy(u);
    		},
    		index: () => {
    			startIndex += 1;
    			return startIndex;
    		},
    		activeClass
    	});

    	const writable_props = [
    		"class",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max",
    		"role",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ItemGroup> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		ITEM_GROUP,
    		setContext,
    		createEventDispatcher,
    		onDestroy,
    		writable,
    		klass,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		role,
    		style,
    		dispatch,
    		valueStore,
    		startIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(4, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(3, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(5, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(6, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(7, max = $$props.max);
    		if ("role" in $$props) $$invalidate(1, role = $$props.role);
    		if ("style" in $$props) $$invalidate(2, style = $$props.style);
    		if ("startIndex" in $$props) startIndex = $$props.startIndex;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 8) {
    			valueStore.set(value);
    		}

    		if ($$self.$$.dirty & /*value*/ 8) {
    			dispatch("change", value);
    		}
    	};

    	return [
    		klass,
    		role,
    		style,
    		value,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		$$scope,
    		slots
    	];
    }

    class ItemGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			class: 0,
    			activeClass: 4,
    			value: 3,
    			multiple: 5,
    			mandatory: 6,
    			max: 7,
    			role: 1,
    			style: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ItemGroup",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get class() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get role() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set role(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<ItemGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<ItemGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* eslint-disable */
    // Shamefully ripped from https://github.com/lukeed/uid
    let IDX = 36;
    let HEX = '';
    while (IDX--) HEX += IDX.toString(36);

    /* node_modules\svelte-materialify\dist\components\Divider\Divider.svelte generated by Svelte v3.37.0 */

    const file$9 = "node_modules\\svelte-materialify\\dist\\components\\Divider\\Divider.svelte";

    function create_fragment$a(ctx) {
    	let hr;
    	let hr_class_value;
    	let hr_aria_orientation_value;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			attr_dev(hr, "class", hr_class_value = "s-divider " + /*klass*/ ctx[0] + " svelte-24id3b");
    			attr_dev(hr, "role", "separator");
    			attr_dev(hr, "aria-orientation", hr_aria_orientation_value = /*vertical*/ ctx[2] ? "vertical" : "horizontal");
    			attr_dev(hr, "style", /*style*/ ctx[3]);
    			toggle_class(hr, "inset", /*inset*/ ctx[1]);
    			toggle_class(hr, "vertical", /*vertical*/ ctx[2]);
    			add_location(hr, file$9, 41, 0, 830);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*klass*/ 1 && hr_class_value !== (hr_class_value = "s-divider " + /*klass*/ ctx[0] + " svelte-24id3b")) {
    				attr_dev(hr, "class", hr_class_value);
    			}

    			if (dirty & /*vertical*/ 4 && hr_aria_orientation_value !== (hr_aria_orientation_value = /*vertical*/ ctx[2] ? "vertical" : "horizontal")) {
    				attr_dev(hr, "aria-orientation", hr_aria_orientation_value);
    			}

    			if (dirty & /*style*/ 8) {
    				attr_dev(hr, "style", /*style*/ ctx[3]);
    			}

    			if (dirty & /*klass, inset*/ 3) {
    				toggle_class(hr, "inset", /*inset*/ ctx[1]);
    			}

    			if (dirty & /*klass, vertical*/ 5) {
    				toggle_class(hr, "vertical", /*vertical*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Divider", slots, []);
    	let { class: klass = "" } = $$props;
    	let { inset = false } = $$props;
    	let { vertical = false } = $$props;
    	let { style = null } = $$props;
    	const writable_props = ["class", "inset", "vertical", "style"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Divider> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("inset" in $$props) $$invalidate(1, inset = $$props.inset);
    		if ("vertical" in $$props) $$invalidate(2, vertical = $$props.vertical);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    	};

    	$$self.$capture_state = () => ({ klass, inset, vertical, style });

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("inset" in $$props) $$invalidate(1, inset = $$props.inset);
    		if ("vertical" in $$props) $$invalidate(2, vertical = $$props.vertical);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [klass, inset, vertical, style];
    }

    class Divider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			class: 0,
    			inset: 1,
    			vertical: 2,
    			style: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get class() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inset() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inset(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\AppBar\AppBar.svelte generated by Svelte v3.37.0 */
    const file$8 = "node_modules\\svelte-materialify\\dist\\components\\AppBar\\AppBar.svelte";
    const get_extension_slot_changes = dirty => ({});
    const get_extension_slot_context = ctx => ({});
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({});
    const get_icon_slot_changes = dirty => ({});
    const get_icon_slot_context = ctx => ({});

    // (95:4) {#if !collapsed}
    function create_if_block$2(ctx) {
    	let div;
    	let current;
    	const title_slot_template = /*#slots*/ ctx[11].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[10], get_title_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (title_slot) title_slot.c();
    			attr_dev(div, "class", "s-app-bar__title");
    			add_location(div, file$8, 95, 6, 2258);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (title_slot) {
    				title_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (title_slot) {
    				if (title_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(title_slot, title_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_title_slot_changes, get_title_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (title_slot) title_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(95:4) {#if !collapsed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let header;
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let header_class_value;
    	let Style_action;
    	let current;
    	let mounted;
    	let dispose;
    	const icon_slot_template = /*#slots*/ ctx[11].icon;
    	const icon_slot = create_slot(icon_slot_template, ctx, /*$$scope*/ ctx[10], get_icon_slot_context);
    	let if_block = !/*collapsed*/ ctx[8] && create_if_block$2(ctx);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const extension_slot_template = /*#slots*/ ctx[11].extension;
    	const extension_slot = create_slot(extension_slot_template, ctx, /*$$scope*/ ctx[10], get_extension_slot_context);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			if (icon_slot) icon_slot.c();
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			if (extension_slot) extension_slot.c();
    			attr_dev(div, "class", "s-app-bar__wrapper");
    			add_location(div, file$8, 92, 2, 2173);
    			attr_dev(header, "class", header_class_value = "s-app-bar " + /*klass*/ ctx[0]);
    			attr_dev(header, "style", /*style*/ ctx[9]);
    			toggle_class(header, "tile", /*tile*/ ctx[2]);
    			toggle_class(header, "flat", /*flat*/ ctx[3]);
    			toggle_class(header, "dense", /*dense*/ ctx[4]);
    			toggle_class(header, "prominent", /*prominent*/ ctx[5]);
    			toggle_class(header, "fixed", /*fixed*/ ctx[6]);
    			toggle_class(header, "absolute", /*absolute*/ ctx[7]);
    			toggle_class(header, "collapsed", /*collapsed*/ ctx[8]);
    			add_location(header, file$8, 81, 0, 1974);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);

    			if (icon_slot) {
    				icon_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t1);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(header, t2);

    			if (extension_slot) {
    				extension_slot.m(header, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(Style_action = Style.call(null, header, { "app-bar-height": /*height*/ ctx[1] }));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (icon_slot) {
    				if (icon_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(icon_slot, icon_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_icon_slot_changes, get_icon_slot_context);
    				}
    			}

    			if (!/*collapsed*/ ctx[8]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*collapsed*/ 256) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (extension_slot) {
    				if (extension_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(extension_slot, extension_slot_template, ctx, /*$$scope*/ ctx[10], dirty, get_extension_slot_changes, get_extension_slot_context);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && header_class_value !== (header_class_value = "s-app-bar " + /*klass*/ ctx[0])) {
    				attr_dev(header, "class", header_class_value);
    			}

    			if (!current || dirty & /*style*/ 512) {
    				attr_dev(header, "style", /*style*/ ctx[9]);
    			}

    			if (Style_action && is_function(Style_action.update) && dirty & /*height*/ 2) Style_action.update.call(null, { "app-bar-height": /*height*/ ctx[1] });

    			if (dirty & /*klass, tile*/ 5) {
    				toggle_class(header, "tile", /*tile*/ ctx[2]);
    			}

    			if (dirty & /*klass, flat*/ 9) {
    				toggle_class(header, "flat", /*flat*/ ctx[3]);
    			}

    			if (dirty & /*klass, dense*/ 17) {
    				toggle_class(header, "dense", /*dense*/ ctx[4]);
    			}

    			if (dirty & /*klass, prominent*/ 33) {
    				toggle_class(header, "prominent", /*prominent*/ ctx[5]);
    			}

    			if (dirty & /*klass, fixed*/ 65) {
    				toggle_class(header, "fixed", /*fixed*/ ctx[6]);
    			}

    			if (dirty & /*klass, absolute*/ 129) {
    				toggle_class(header, "absolute", /*absolute*/ ctx[7]);
    			}

    			if (dirty & /*klass, collapsed*/ 257) {
    				toggle_class(header, "collapsed", /*collapsed*/ ctx[8]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_slot, local);
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			transition_in(extension_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_slot, local);
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			transition_out(extension_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (icon_slot) icon_slot.d(detaching);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			if (extension_slot) extension_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("AppBar", slots, ['icon','title','default','extension']);
    	let { class: klass = "" } = $$props;
    	let { height = "56px" } = $$props;
    	let { tile = false } = $$props;
    	let { flat = false } = $$props;
    	let { dense = false } = $$props;
    	let { prominent = false } = $$props;
    	let { fixed = false } = $$props;
    	let { absolute = false } = $$props;
    	let { collapsed = false } = $$props;
    	let { style = "" } = $$props;

    	const writable_props = [
    		"class",
    		"height",
    		"tile",
    		"flat",
    		"dense",
    		"prominent",
    		"fixed",
    		"absolute",
    		"collapsed",
    		"style"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AppBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("dense" in $$props) $$invalidate(4, dense = $$props.dense);
    		if ("prominent" in $$props) $$invalidate(5, prominent = $$props.prominent);
    		if ("fixed" in $$props) $$invalidate(6, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(7, absolute = $$props.absolute);
    		if ("collapsed" in $$props) $$invalidate(8, collapsed = $$props.collapsed);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Style,
    		klass,
    		height,
    		tile,
    		flat,
    		dense,
    		prominent,
    		fixed,
    		absolute,
    		collapsed,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("tile" in $$props) $$invalidate(2, tile = $$props.tile);
    		if ("flat" in $$props) $$invalidate(3, flat = $$props.flat);
    		if ("dense" in $$props) $$invalidate(4, dense = $$props.dense);
    		if ("prominent" in $$props) $$invalidate(5, prominent = $$props.prominent);
    		if ("fixed" in $$props) $$invalidate(6, fixed = $$props.fixed);
    		if ("absolute" in $$props) $$invalidate(7, absolute = $$props.absolute);
    		if ("collapsed" in $$props) $$invalidate(8, collapsed = $$props.collapsed);
    		if ("style" in $$props) $$invalidate(9, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		height,
    		tile,
    		flat,
    		dense,
    		prominent,
    		fixed,
    		absolute,
    		collapsed,
    		style,
    		$$scope,
    		slots
    	];
    }

    class AppBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			class: 0,
    			height: 1,
    			tile: 2,
    			flat: 3,
    			dense: 4,
    			prominent: 5,
    			fixed: 6,
    			absolute: 7,
    			collapsed: 8,
    			style: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppBar",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get class() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tile() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tile(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dense() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dense(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prominent() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prominent(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixed() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixed(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get absolute() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set absolute(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get collapsed() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set collapsed(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<AppBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<AppBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var prevIcon = 'M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z';

    var nextIcon = 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z';

    /* node_modules\svelte-materialify\dist\components\SlideGroup\SlideGroup.svelte generated by Svelte v3.37.0 */
    const file$7 = "node_modules\\svelte-materialify\\dist\\components\\SlideGroup\\SlideGroup.svelte";
    const get_next_slot_changes = dirty => ({});
    const get_next_slot_context = ctx => ({});
    const get_previous_slot_changes = dirty => ({});
    const get_previous_slot_context = ctx => ({});

    // (106:2) {#if arrowsVisible}
    function create_if_block_1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const previous_slot_template = /*#slots*/ ctx[17].previous;
    	const previous_slot = create_slot(previous_slot_template, ctx, /*$$scope*/ ctx[22], get_previous_slot_context);
    	const previous_slot_or_fallback = previous_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (previous_slot_or_fallback) previous_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__prev");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$7, 106, 4, 2532);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (previous_slot_or_fallback) {
    				previous_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*prev*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (previous_slot) {
    				if (previous_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(previous_slot, previous_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_previous_slot_changes, get_previous_slot_context);
    				}
    			}

    			if (dirty & /*x*/ 512) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === 0);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "hide-disabled-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previous_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previous_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (previous_slot_or_fallback) previous_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(106:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (112:28)          
    function fallback_block_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: prevIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(112:28)          ",
    		ctx
    	});

    	return block;
    }

    // (129:2) {#if arrowsVisible}
    function create_if_block$1(ctx) {
    	let div;
    	let current;
    	let mounted;
    	let dispose;
    	const next_slot_template = /*#slots*/ ctx[17].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[22], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    			attr_dev(div, "class", "s-slide-group__next");
    			toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			add_location(div, file$7, 129, 4, 3117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*next*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(next_slot, next_slot_template, ctx, /*$$scope*/ ctx[22], dirty, get_next_slot_changes, get_next_slot_context);
    				}
    			}

    			if (dirty & /*x, contentWidth, wrapperWidth*/ 896) {
    				toggle_class(div, "disabled", /*x*/ ctx[9] === /*contentWidth*/ ctx[7] - /*wrapperWidth*/ ctx[8]);
    			}

    			if (dirty & /*hideDisabledArrows*/ 4) {
    				toggle_class(div, "show-arrows", /*hideDisabledArrows*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(129:2) {#if arrowsVisible}",
    		ctx
    	});

    	return block;
    }

    // (135:24)          
    function fallback_block(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: nextIcon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(135:24)          ",
    		ctx
    	});

    	return block;
    }

    // (98:0) <ItemGroup   class="s-slide-group {klass}"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>
    function create_default_slot$3(ctx) {
    	let t0;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let div1_resize_listener;
    	let t1;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*arrowsVisible*/ ctx[10] && create_if_block_1(ctx);
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);
    	let if_block1 = /*arrowsVisible*/ ctx[10] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(div0, "class", "s-slide-group__content");
    			set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[18].call(div0));
    			add_location(div0, file$7, 121, 4, 2933);
    			attr_dev(div1, "class", "s-slide-group__wrapper");
    			add_render_callback(() => /*div1_elementresize_handler*/ ctx[19].call(div1));
    			add_location(div1, file$7, 116, 2, 2776);
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[18].bind(div0));
    			div1_resize_listener = add_resize_listener(div1, /*div1_elementresize_handler*/ ctx[19].bind(div1));
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "touchstart", /*touchstart*/ ctx[13], { passive: true }, false, false),
    					listen_dev(div1, "touchmove", /*touchmove*/ ctx[14], { passive: true }, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*x*/ 512) {
    				set_style(div0, "transform", "translate(-" + /*x*/ ctx[9] + "px)");
    			}

    			if (/*arrowsVisible*/ ctx[10]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*arrowsVisible*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			div0_resize_listener();
    			div1_resize_listener();
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(98:0) <ItemGroup   class=\\\"s-slide-group {klass}\\\"   on:change   bind:value   {activeClass}   {multiple}   {mandatory}   {max}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let itemgroup;
    	let updating_value;
    	let current;

    	function itemgroup_value_binding(value) {
    		/*itemgroup_value_binding*/ ctx[20](value);
    	}

    	let itemgroup_props = {
    		class: "s-slide-group " + /*klass*/ ctx[1],
    		activeClass: /*activeClass*/ ctx[3],
    		multiple: /*multiple*/ ctx[4],
    		mandatory: /*mandatory*/ ctx[5],
    		max: /*max*/ ctx[6],
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		itemgroup_props.value = /*value*/ ctx[0];
    	}

    	itemgroup = new ItemGroup({ props: itemgroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(itemgroup, "value", itemgroup_value_binding));
    	itemgroup.$on("change", /*change_handler*/ ctx[21]);

    	const block = {
    		c: function create() {
    			create_component(itemgroup.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(itemgroup, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const itemgroup_changes = {};
    			if (dirty & /*klass*/ 2) itemgroup_changes.class = "s-slide-group " + /*klass*/ ctx[1];
    			if (dirty & /*activeClass*/ 8) itemgroup_changes.activeClass = /*activeClass*/ ctx[3];
    			if (dirty & /*multiple*/ 16) itemgroup_changes.multiple = /*multiple*/ ctx[4];
    			if (dirty & /*mandatory*/ 32) itemgroup_changes.mandatory = /*mandatory*/ ctx[5];
    			if (dirty & /*max*/ 64) itemgroup_changes.max = /*max*/ ctx[6];

    			if (dirty & /*$$scope, x, contentWidth, wrapperWidth, hideDisabledArrows, arrowsVisible*/ 4196228) {
    				itemgroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				itemgroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			itemgroup.$set(itemgroup_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(itemgroup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(itemgroup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(itemgroup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const SLIDE_GROUP = {};

    function instance$8($$self, $$props, $$invalidate) {
    	let arrowsVisible;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SlideGroup", slots, ['previous','default','next']);
    	let contentWidth;
    	let wrapperWidth;
    	let { class: klass = "" } = $$props;
    	let { showArrows = true } = $$props;
    	let { hideDisabledArrows = false } = $$props;
    	let { centerActive = false } = $$props;
    	let { activeClass = "" } = $$props;
    	let { value = [] } = $$props;
    	let { multiple = false } = $$props;
    	let { mandatory = false } = $$props;
    	let { max = Infinity } = $$props;
    	let x = 0;

    	setContext(SLIDE_GROUP, item => {
    		const left = item.offsetLeft;
    		const width = item.offsetWidth;

    		if (centerActive) $$invalidate(9, x = left + (width - wrapperWidth) / 2); else if (left + 1.25 * width > wrapperWidth + x) {
    			$$invalidate(9, x = left + 1.25 * width - wrapperWidth);
    		} else if (left < x + width / 4) {
    			$$invalidate(9, x = left - width / 4);
    		}
    	});

    	afterUpdate(() => {
    		if (x + wrapperWidth > contentWidth) $$invalidate(9, x = contentWidth - wrapperWidth); else if (x < 0) $$invalidate(9, x = 0);
    	});

    	function next() {
    		$$invalidate(9, x += wrapperWidth);
    	}

    	function prev() {
    		$$invalidate(9, x -= wrapperWidth);
    	}

    	let touchStartX;

    	function touchstart({ touches }) {
    		touchStartX = x + touches[0].clientX;
    	}

    	function touchmove({ touches }) {
    		$$invalidate(9, x = touchStartX - touches[0].clientX);
    	}

    	const writable_props = [
    		"class",
    		"showArrows",
    		"hideDisabledArrows",
    		"centerActive",
    		"activeClass",
    		"value",
    		"multiple",
    		"mandatory",
    		"max"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SlideGroup> was created with unknown prop '${key}'`);
    	});

    	function div0_elementresize_handler() {
    		contentWidth = this.clientWidth;
    		$$invalidate(7, contentWidth);
    	}

    	function div1_elementresize_handler() {
    		wrapperWidth = this.clientWidth;
    		$$invalidate(8, wrapperWidth);
    	}

    	function itemgroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("showArrows" in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ("hideDisabledArrows" in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ("centerActive" in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ("activeClass" in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		SLIDE_GROUP,
    		setContext,
    		afterUpdate,
    		ItemGroup,
    		prevIcon,
    		nextIcon,
    		Icon,
    		contentWidth,
    		wrapperWidth,
    		klass,
    		showArrows,
    		hideDisabledArrows,
    		centerActive,
    		activeClass,
    		value,
    		multiple,
    		mandatory,
    		max,
    		x,
    		next,
    		prev,
    		touchStartX,
    		touchstart,
    		touchmove,
    		arrowsVisible
    	});

    	$$self.$inject_state = $$props => {
    		if ("contentWidth" in $$props) $$invalidate(7, contentWidth = $$props.contentWidth);
    		if ("wrapperWidth" in $$props) $$invalidate(8, wrapperWidth = $$props.wrapperWidth);
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("showArrows" in $$props) $$invalidate(15, showArrows = $$props.showArrows);
    		if ("hideDisabledArrows" in $$props) $$invalidate(2, hideDisabledArrows = $$props.hideDisabledArrows);
    		if ("centerActive" in $$props) $$invalidate(16, centerActive = $$props.centerActive);
    		if ("activeClass" in $$props) $$invalidate(3, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("multiple" in $$props) $$invalidate(4, multiple = $$props.multiple);
    		if ("mandatory" in $$props) $$invalidate(5, mandatory = $$props.mandatory);
    		if ("max" in $$props) $$invalidate(6, max = $$props.max);
    		if ("x" in $$props) $$invalidate(9, x = $$props.x);
    		if ("touchStartX" in $$props) touchStartX = $$props.touchStartX;
    		if ("arrowsVisible" in $$props) $$invalidate(10, arrowsVisible = $$props.arrowsVisible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wrapperWidth, contentWidth, showArrows*/ 33152) {
    			$$invalidate(10, arrowsVisible = wrapperWidth < contentWidth && showArrows);
    		}
    	};

    	return [
    		value,
    		klass,
    		hideDisabledArrows,
    		activeClass,
    		multiple,
    		mandatory,
    		max,
    		contentWidth,
    		wrapperWidth,
    		x,
    		arrowsVisible,
    		next,
    		prev,
    		touchstart,
    		touchmove,
    		showArrows,
    		centerActive,
    		slots,
    		div0_elementresize_handler,
    		div1_elementresize_handler,
    		itemgroup_value_binding,
    		change_handler,
    		$$scope
    	];
    }

    class SlideGroup extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			class: 1,
    			showArrows: 15,
    			hideDisabledArrows: 2,
    			centerActive: 16,
    			activeClass: 3,
    			value: 0,
    			multiple: 4,
    			mandatory: 5,
    			max: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SlideGroup",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get class() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hideDisabledArrows() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hideDisabledArrows(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mandatory() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mandatory(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<SlideGroup>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<SlideGroup>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Window\Window.svelte generated by Svelte v3.37.0 */
    const file$6 = "node_modules\\svelte-materialify\\dist\\components\\Window\\Window.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "s-window " + /*klass*/ ctx[0]);
    			toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			add_location(div, file$6, 118, 0, 3563);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[12](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && div_class_value !== (div_class_value = "s-window " + /*klass*/ ctx[0])) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "horizontal", !/*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, vertical*/ 3) {
    				toggle_class(div, "vertical", /*vertical*/ ctx[1]);
    			}

    			if (dirty & /*klass, reverse*/ 5) {
    				toggle_class(div, "reverse", /*reverse*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const WINDOW = {};

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Window", slots, ['default']);
    	let { class: klass = "" } = $$props;
    	let { activeClass = "active" } = $$props;
    	let { value = 0 } = $$props;
    	let { vertical = false } = $$props;
    	let { reverse = false } = $$props;
    	let { continuous = true } = $$props;
    	let container;
    	const windowItems = [];
    	let moving = false;

    	setContext(WINDOW, window => {
    		windowItems.push(window);
    	});

    	function set(index) {
    		const prevIndex = windowItems.findIndex(i => i.classList.contains(activeClass));

    		if (!moving && windowItems[index] && index !== prevIndex) {
    			moving = true;
    			let direction;
    			let position;

    			if (index > prevIndex) {
    				direction = "left";
    				position = "next";
    			} else {
    				direction = "right";
    				position = "prev";
    			}

    			const prev = windowItems[prevIndex];
    			prev.classList.add(direction);
    			$$invalidate(3, container.style.height = `${prev.offsetHeight}px`, container);
    			const active = windowItems[index];
    			active.classList.add(position);
    			$$invalidate(3, container.style.height = `${active.offsetHeight}px`, container);
    			active.classList.add(direction);

    			setTimeout(
    				() => {
    					prev.classList.remove("active", direction);
    					active.classList.add("active");
    					active.classList.remove(position, direction);
    					$$invalidate(3, container.style.height = null, container);
    					moving = false;
    					$$invalidate(4, value = index);
    				},
    				300
    			);
    		}
    	}

    	function next() {
    		if (value === windowItems.length - 1) {
    			if (continuous) set(0);
    		} else {
    			set(value + 1);
    		}
    	}

    	function previous() {
    		if (value === 0) {
    			if (continuous) set(windowItems.length - 1);
    		} else {
    			set(value - 1);
    		}
    	}

    	onMount(() => {
    		const activeItem = windowItems[value];
    		if (activeItem) activeItem.classList.add(activeClass);
    	});

    	const writable_props = ["class", "activeClass", "value", "vertical", "reverse", "continuous"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Window> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(3, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("activeClass" in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("vertical" in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("continuous" in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		WINDOW,
    		onMount,
    		setContext,
    		klass,
    		activeClass,
    		value,
    		vertical,
    		reverse,
    		continuous,
    		container,
    		windowItems,
    		moving,
    		set,
    		next,
    		previous
    	});

    	$$self.$inject_state = $$props => {
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("activeClass" in $$props) $$invalidate(5, activeClass = $$props.activeClass);
    		if ("value" in $$props) $$invalidate(4, value = $$props.value);
    		if ("vertical" in $$props) $$invalidate(1, vertical = $$props.vertical);
    		if ("reverse" in $$props) $$invalidate(2, reverse = $$props.reverse);
    		if ("continuous" in $$props) $$invalidate(6, continuous = $$props.continuous);
    		if ("container" in $$props) $$invalidate(3, container = $$props.container);
    		if ("moving" in $$props) moving = $$props.moving;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 16) {
    			set(value);
    		}
    	};

    	return [
    		klass,
    		vertical,
    		reverse,
    		container,
    		value,
    		activeClass,
    		continuous,
    		set,
    		next,
    		previous,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Window extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {
    			class: 0,
    			activeClass: 5,
    			value: 4,
    			vertical: 1,
    			reverse: 2,
    			continuous: 6,
    			set: 7,
    			next: 8,
    			previous: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Window",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get class() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get continuous() {
    		throw new Error("<Window>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set continuous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get set() {
    		return this.$$.ctx[7];
    	}

    	set set(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		return this.$$.ctx[8];
    	}

    	set next(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previous() {
    		return this.$$.ctx[9];
    	}

    	set previous(value) {
    		throw new Error("<Window>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Tabs\Tabs.svelte generated by Svelte v3.37.0 */
    const file$5 = "node_modules\\svelte-materialify\\dist\\components\\Tabs\\Tabs.svelte";
    const get_tabs_slot_changes = dirty => ({});
    const get_tabs_slot_context = ctx => ({});

    // (150:6) {#if slider}
    function create_if_block(ctx) {
    	let div;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10]);
    			add_location(div, file$5, 150, 8, 3567);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[17](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*sliderClass*/ 1024 && div_class_value !== (div_class_value = "s-tab-slider " + /*sliderClass*/ ctx[10])) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[17](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(150:6) {#if slider}",
    		ctx
    	});

    	return block;
    }

    // (142:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>
    function create_default_slot_1$1(ctx) {
    	let t;
    	let if_block_anchor;
    	let current;
    	const tabs_slot_template = /*#slots*/ ctx[16].tabs;
    	const tabs_slot = create_slot(tabs_slot_template, ctx, /*$$scope*/ ctx[21], get_tabs_slot_context);
    	let if_block = /*slider*/ ctx[9] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (tabs_slot) tabs_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (tabs_slot) {
    				tabs_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (tabs_slot) {
    				if (tabs_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(tabs_slot, tabs_slot_template, ctx, /*$$scope*/ ctx[21], dirty, get_tabs_slot_changes, get_tabs_slot_context);
    				}
    			}

    			if (/*slider*/ ctx[9]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (tabs_slot) tabs_slot.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(142:4) <SlideGroup       bind:value       mandatory       {centerActive}       {showArrows}       on:change={moveSlider}       on:change>",
    		ctx
    	});

    	return block;
    }

    // (155:2) <Window bind:this={windowComponent}>
    function create_default_slot$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[21], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2097152) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[21], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(155:2) <Window bind:this={windowComponent}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let slidegroup;
    	let updating_value;
    	let div0_class_value;
    	let t;
    	let window;
    	let current;

    	function slidegroup_value_binding(value) {
    		/*slidegroup_value_binding*/ ctx[18](value);
    	}

    	let slidegroup_props = {
    		mandatory: true,
    		centerActive: /*centerActive*/ ctx[2],
    		showArrows: /*showArrows*/ ctx[3],
    		$$slots: { default: [create_default_slot_1$1] },
    		$$scope: { ctx }
    	};

    	if (/*value*/ ctx[0] !== void 0) {
    		slidegroup_props.value = /*value*/ ctx[0];
    	}

    	slidegroup = new SlideGroup({ props: slidegroup_props, $$inline: true });
    	binding_callbacks.push(() => bind(slidegroup, "value", slidegroup_value_binding));
    	slidegroup.$on("change", /*moveSlider*/ ctx[14]);
    	slidegroup.$on("change", /*change_handler*/ ctx[19]);

    	let window_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	window = new Window({ props: window_props, $$inline: true });
    	/*window_binding*/ ctx[20](window);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(slidegroup.$$.fragment);
    			t = space();
    			create_component(window.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1]);
    			attr_dev(div0, "role", "tablist");
    			toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			toggle_class(div0, "right", /*right*/ ctx[7]);
    			toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			add_location(div0, file$5, 133, 2, 3223);
    			attr_dev(div1, "class", "s-tabs");
    			attr_dev(div1, "role", "tablist");
    			toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			add_location(div1, file$5, 132, 0, 3170);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(slidegroup, div0, null);
    			append_dev(div1, t);
    			mount_component(window, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const slidegroup_changes = {};
    			if (dirty & /*centerActive*/ 4) slidegroup_changes.centerActive = /*centerActive*/ ctx[2];
    			if (dirty & /*showArrows*/ 8) slidegroup_changes.showArrows = /*showArrows*/ ctx[3];

    			if (dirty & /*$$scope, sliderClass, sliderElement, slider*/ 2102784) {
    				slidegroup_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*value*/ 1) {
    				updating_value = true;
    				slidegroup_changes.value = /*value*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			slidegroup.$set(slidegroup_changes);

    			if (!current || dirty & /*klass*/ 2 && div0_class_value !== (div0_class_value = "s-tabs-bar " + /*klass*/ ctx[1])) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*klass, fixedTabs*/ 18) {
    				toggle_class(div0, "fixed-tabs", /*fixedTabs*/ ctx[4]);
    			}

    			if (dirty & /*klass, grow*/ 34) {
    				toggle_class(div0, "grow", /*grow*/ ctx[5]);
    			}

    			if (dirty & /*klass, centered*/ 66) {
    				toggle_class(div0, "centered", /*centered*/ ctx[6]);
    			}

    			if (dirty & /*klass, right*/ 130) {
    				toggle_class(div0, "right", /*right*/ ctx[7]);
    			}

    			if (dirty & /*klass, icons*/ 258) {
    				toggle_class(div0, "icons", /*icons*/ ctx[8]);
    			}

    			const window_changes = {};

    			if (dirty & /*$$scope*/ 2097152) {
    				window_changes.$$scope = { dirty, ctx };
    			}

    			window.$set(window_changes);

    			if (dirty & /*vertical*/ 2048) {
    				toggle_class(div1, "vertical", /*vertical*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(slidegroup.$$.fragment, local);
    			transition_in(window.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(slidegroup.$$.fragment, local);
    			transition_out(window.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(slidegroup);
    			/*window_binding*/ ctx[20](null);
    			destroy_component(window);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const TABS = {};

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tabs", slots, ['tabs','default']);
    	let sliderElement;
    	let windowComponent;
    	const tabs = [];
    	let { class: klass = "" } = $$props;
    	let { value = 0 } = $$props;
    	let { centerActive = false } = $$props;
    	let { showArrows = true } = $$props;
    	let { fixedTabs = false } = $$props;
    	let { grow = false } = $$props;
    	let { centered = false } = $$props;
    	let { right = false } = $$props;
    	let { icons = false } = $$props;
    	let { slider = true } = $$props;
    	let { sliderClass = "" } = $$props;
    	let { ripple = {} } = $$props;
    	let { vertical = false } = $$props;

    	setContext(TABS, {
    		ripple,
    		registerTab: tab => {
    			tabs.push(tab);
    		}
    	});

    	function moveSlider({ detail }) {
    		if (slider) {
    			const activeTab = tabs[detail];

    			if (vertical) {
    				$$invalidate(12, sliderElement.style.top = `${activeTab.offsetTop}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.height = `${activeTab.offsetHeight}px`, sliderElement);
    			} else {
    				$$invalidate(12, sliderElement.style.left = `${activeTab.offsetLeft}px`, sliderElement);
    				$$invalidate(12, sliderElement.style.width = `${activeTab.offsetWidth}px`, sliderElement);
    			}
    		}

    		windowComponent.set(value);
    	}

    	onMount(() => {
    		moveSlider({ detail: value });
    	});

    	const writable_props = [
    		"class",
    		"value",
    		"centerActive",
    		"showArrows",
    		"fixedTabs",
    		"grow",
    		"centered",
    		"right",
    		"icons",
    		"slider",
    		"sliderClass",
    		"ripple",
    		"vertical"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tabs> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sliderElement = $$value;
    			$$invalidate(12, sliderElement);
    		});
    	}

    	function slidegroup_value_binding(value$1) {
    		value = value$1;
    		$$invalidate(0, value);
    	}

    	function change_handler(event) {
    		bubble($$self, event);
    	}

    	function window_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			windowComponent = $$value;
    			$$invalidate(13, windowComponent);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(1, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("centerActive" in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ("showArrows" in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ("fixedTabs" in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ("grow" in $$props) $$invalidate(5, grow = $$props.grow);
    		if ("centered" in $$props) $$invalidate(6, centered = $$props.centered);
    		if ("right" in $$props) $$invalidate(7, right = $$props.right);
    		if ("icons" in $$props) $$invalidate(8, icons = $$props.icons);
    		if ("slider" in $$props) $$invalidate(9, slider = $$props.slider);
    		if ("sliderClass" in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ("vertical" in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ("$$scope" in $$props) $$invalidate(21, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		TABS,
    		SlideGroup,
    		Window,
    		onMount,
    		setContext,
    		sliderElement,
    		windowComponent,
    		tabs,
    		klass,
    		value,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		ripple,
    		vertical,
    		moveSlider
    	});

    	$$self.$inject_state = $$props => {
    		if ("sliderElement" in $$props) $$invalidate(12, sliderElement = $$props.sliderElement);
    		if ("windowComponent" in $$props) $$invalidate(13, windowComponent = $$props.windowComponent);
    		if ("klass" in $$props) $$invalidate(1, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("centerActive" in $$props) $$invalidate(2, centerActive = $$props.centerActive);
    		if ("showArrows" in $$props) $$invalidate(3, showArrows = $$props.showArrows);
    		if ("fixedTabs" in $$props) $$invalidate(4, fixedTabs = $$props.fixedTabs);
    		if ("grow" in $$props) $$invalidate(5, grow = $$props.grow);
    		if ("centered" in $$props) $$invalidate(6, centered = $$props.centered);
    		if ("right" in $$props) $$invalidate(7, right = $$props.right);
    		if ("icons" in $$props) $$invalidate(8, icons = $$props.icons);
    		if ("slider" in $$props) $$invalidate(9, slider = $$props.slider);
    		if ("sliderClass" in $$props) $$invalidate(10, sliderClass = $$props.sliderClass);
    		if ("ripple" in $$props) $$invalidate(15, ripple = $$props.ripple);
    		if ("vertical" in $$props) $$invalidate(11, vertical = $$props.vertical);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		klass,
    		centerActive,
    		showArrows,
    		fixedTabs,
    		grow,
    		centered,
    		right,
    		icons,
    		slider,
    		sliderClass,
    		vertical,
    		sliderElement,
    		windowComponent,
    		moveSlider,
    		ripple,
    		slots,
    		div_binding,
    		slidegroup_value_binding,
    		change_handler,
    		window_binding,
    		$$scope
    	];
    }

    class Tabs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 1,
    			value: 0,
    			centerActive: 2,
    			showArrows: 3,
    			fixedTabs: 4,
    			grow: 5,
    			centered: 6,
    			right: 7,
    			icons: 8,
    			slider: 9,
    			sliderClass: 10,
    			ripple: 15,
    			vertical: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tabs",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get class() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centerActive() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centerActive(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showArrows() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showArrows(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fixedTabs() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fixedTabs(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grow() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grow(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get centered() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set centered(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get right() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set right(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icons() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icons(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get slider() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set slider(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sliderClass() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sliderClass(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ripple() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ripple(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Tabs>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Tabs>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-materialify\dist\components\Tabs\Tab.svelte generated by Svelte v3.37.0 */
    const file$4 = "node_modules\\svelte-materialify\\dist\\components\\Tabs\\Tab.svelte";

    function create_fragment$5(ctx) {
    	let button;
    	let button_class_value;
    	let button_tabindex_value;
    	let Class_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			if (default_slot) default_slot.c();
    			attr_dev(button, "class", button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0]);
    			attr_dev(button, "role", "tab");
    			attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			attr_dev(button, "tabindex", button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0);
    			toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			toggle_class(button, "active", /*active*/ ctx[4]);
    			add_location(button, file$4, 86, 0, 2027);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			/*button_binding*/ ctx[11](button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(Class_action = Class.call(null, button, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]])),
    					listen_dev(button, "click", /*selectTab*/ ctx[6], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false),
    					action_destroyer(Ripple.call(null, button, /*ripple*/ ctx[5]))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 256) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*klass*/ 1 && button_class_value !== (button_class_value = "s-tab s-slide-item " + /*klass*/ ctx[0])) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*active*/ 16) {
    				attr_dev(button, "aria-selected", /*active*/ ctx[4]);
    			}

    			if (!current || dirty & /*disabled*/ 4 && button_tabindex_value !== (button_tabindex_value = /*disabled*/ ctx[2] ? -1 : 0)) {
    				attr_dev(button, "tabindex", button_tabindex_value);
    			}

    			if (Class_action && is_function(Class_action.update) && dirty & /*active, activeClass*/ 18) Class_action.update.call(null, [/*active*/ ctx[4] && /*activeClass*/ ctx[1]]);

    			if (dirty & /*klass, disabled*/ 5) {
    				toggle_class(button, "disabled", /*disabled*/ ctx[2]);
    			}

    			if (dirty & /*klass, active*/ 17) {
    				toggle_class(button, "active", /*active*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			/*button_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tab", slots, ['default']);
    	let tab;
    	const click = getContext(SLIDE_GROUP);
    	const ITEM = getContext(ITEM_GROUP);
    	const { ripple, registerTab } = getContext(TABS);
    	let { class: klass = "" } = $$props;
    	let { value = ITEM.index() } = $$props;
    	let { activeClass = ITEM.activeClass } = $$props;
    	let { disabled = false } = $$props;
    	let active;

    	ITEM.register(values => {
    		$$invalidate(4, active = values.includes(value));
    	});

    	function selectTab({ target }) {
    		if (!disabled) {
    			click(target);
    			ITEM.select(value);
    		}
    	}

    	onMount(() => {
    		registerTab(tab);
    	});

    	const writable_props = ["class", "value", "activeClass", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function button_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tab = $$value;
    			$$invalidate(3, tab);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("class" in $$props) $$invalidate(0, klass = $$props.class);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onMount,
    		SLIDE_GROUP,
    		ITEM_GROUP,
    		TABS,
    		Class,
    		Ripple,
    		tab,
    		click,
    		ITEM,
    		ripple,
    		registerTab,
    		klass,
    		value,
    		activeClass,
    		disabled,
    		active,
    		selectTab
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(3, tab = $$props.tab);
    		if ("klass" in $$props) $$invalidate(0, klass = $$props.klass);
    		if ("value" in $$props) $$invalidate(7, value = $$props.value);
    		if ("activeClass" in $$props) $$invalidate(1, activeClass = $$props.activeClass);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$props.disabled);
    		if ("active" in $$props) $$invalidate(4, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		klass,
    		activeClass,
    		disabled,
    		tab,
    		active,
    		ripple,
    		selectTab,
    		value,
    		$$scope,
    		slots,
    		click_handler,
    		button_binding
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			class: 0,
    			value: 7,
    			activeClass: 1,
    			disabled: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get class() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeClass() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeClass(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Material Design Icons v5.9.55
    var mdiClipboardList = "M19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M7 8H9V12H8V9H7V8M10 17V18H7V17.08L9 15H7V14H9.25C9.66 14 10 14.34 10 14.75C10 14.95 9.92 15.14 9.79 15.27L8.12 17H10M11 4C11 3.45 11.45 3 12 3S13 3.45 13 4 12.55 5 12 5 11 4.55 11 4M17 17H12V15H17V17M17 11H12V9H17V11Z";
    var mdiStar = "M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z";
    var mdiThemeLightDark = "M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z";
    var mdiViewDashboard = "M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z";

    /* src\routes\Home.svelte generated by Svelte v3.37.0 */

    const file$3 = "src\\routes\\Home.svelte";

    function create_fragment$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "home";
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\routes\List.svelte generated by Svelte v3.37.0 */

    const file$2 = "src\\routes\\List.svelte";

    function create_fragment$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "list";
    			add_location(div, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\routes\Reviews.svelte generated by Svelte v3.37.0 */

    const file$1 = "src\\routes\\Reviews.svelte";

    function create_fragment$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "reviews";
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Reviews", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Reviews> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Reviews extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reviews",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\components\NavBar.svelte generated by Svelte v3.37.0 */
    const file = "src\\components\\NavBar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (38:10) <Tab>
    function create_default_slot_3(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: /*tab*/ ctx[5].icon },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(38:10) <Tab>",
    		ctx
    	});

    	return block;
    }

    // (37:8) {#each tabs as tab}
    function create_each_block(ctx) {
    	let tab;
    	let current;

    	tab = new Tab({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tab_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				tab_changes.$$scope = { dirty, ctx };
    			}

    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(37:8) {#each tabs as tab}",
    		ctx
    	});

    	return block;
    }

    // (36:6) 
    function create_tabs_slot(ctx) {
    	let div;
    	let current;
    	let each_value = /*tabs*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "tabs");
    			add_location(div, file, 35, 6, 910);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tabs*/ 1) {
    				each_value = /*tabs*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_tabs_slot.name,
    		type: "slot",
    		source: "(36:6) ",
    		ctx
    	});

    	return block;
    }

    // (45:4) <Button class="topBarRightButtons" depressed on:click={switchTheme}        >
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Login");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(45:4) <Button class=\\\"topBarRightButtons\\\" depressed on:click={switchTheme}        >",
    		ctx
    	});

    	return block;
    }

    // (48:4) <Button class="topBarRightButtons" icon on:click={switchTheme}>
    function create_default_slot_1(ctx) {
    	let icon;
    	let current;

    	icon = new Icon({
    			props: { path: mdiThemeLightDark },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(icon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(48:4) <Button class=\\\"topBarRightButtons\\\" icon on:click={switchTheme}>",
    		ctx
    	});

    	return block;
    }

    // (31:0) <AppBar dense>
    function create_default_slot$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let tabs_1;
    	let t1;
    	let divider;
    	let t2;
    	let div2;
    	let button0;
    	let t3;
    	let button1;
    	let current;

    	tabs_1 = new Tabs({
    			props: {
    				centered: true,
    				fixedTabs: true,
    				$$slots: { tabs: [create_tabs_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	tabs_1.$on("change", /*changePage*/ ctx[2]);

    	divider = new Divider({
    			props: { vertical: true },
    			$$inline: true
    		});

    	button0 = new Button({
    			props: {
    				class: "topBarRightButtons",
    				depressed: true,
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*switchTheme*/ ctx[1]);

    	button1 = new Button({
    			props: {
    				class: "topBarRightButtons",
    				icon: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*switchTheme*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			create_component(tabs_1.$$.fragment);
    			t1 = space();
    			create_component(divider.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(button0.$$.fragment);
    			t3 = space();
    			create_component(button1.$$.fragment);
    			set_style(div0, "flex-grow", "1");
    			add_location(div0, file, 32, 2, 799);
    			attr_dev(div1, "class", "tabs svelte-easrf7");
    			add_location(div1, file, 33, 2, 830);
    			attr_dev(div2, "class", "staticButtons svelte-easrf7");
    			add_location(div2, file, 43, 2, 1085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(tabs_1, div1, null);
    			insert_dev(target, t1, anchor);
    			mount_component(divider, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(button0, div2, null);
    			append_dev(div2, t3);
    			mount_component(button1, div2, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabs_1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				tabs_1_changes.$$scope = { dirty, ctx };
    			}

    			tabs_1.$set(tabs_1_changes);
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabs_1.$$.fragment, local);
    			transition_in(divider.$$.fragment, local);
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabs_1.$$.fragment, local);
    			transition_out(divider.$$.fragment, local);
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(tabs_1);
    			if (detaching) detach_dev(t1);
    			destroy_component(divider, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(31:0) <AppBar dense>",
    		ctx
    	});

    	return block;
    }

    // (32:2) 
    function create_title_slot(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Gin-ger shots";
    			attr_dev(span, "slot", "title");
    			add_location(span, file, 31, 2, 756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(32:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let appbar;
    	let current;

    	appbar = new AppBar({
    			props: {
    				dense: true,
    				$$slots: {
    					title: [create_title_slot],
    					default: [create_default_slot$1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(appbar.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(appbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const appbar_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				appbar_changes.$$scope = { dirty, ctx };
    			}

    			appbar.$set(appbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(appbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("NavBar", slots, []);
    	let { page } = $$props;
    	let { theme } = $$props;

    	const tabs = [
    		{ icon: mdiViewDashboard, link: Home },
    		{ icon: mdiClipboardList, link: List },
    		{ icon: mdiStar, link: Reviews }
    	];

    	const switchTheme = () => {
    		$$invalidate(4, theme = theme === "light" ? "dark" : "light");
    	};

    	const changePage = evt => {
    		$$invalidate(3, page = tabs[evt.detail]?.link || "home");
    	};

    	const writable_props = ["page", "theme"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NavBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("page" in $$props) $$invalidate(3, page = $$props.page);
    		if ("theme" in $$props) $$invalidate(4, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({
    		Button,
    		Icon,
    		AppBar,
    		Divider,
    		Tabs,
    		Tab,
    		mdiThemeLightDark,
    		mdiViewDashboard,
    		mdiStar,
    		mdiClipboardList,
    		Home,
    		List,
    		Reviews,
    		page,
    		theme,
    		tabs,
    		switchTheme,
    		changePage
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(3, page = $$props.page);
    		if ("theme" in $$props) $$invalidate(4, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tabs, switchTheme, changePage, page, theme];
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { page: 3, theme: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*page*/ ctx[3] === undefined && !("page" in props)) {
    			console.warn("<NavBar> was created without expected prop 'page'");
    		}

    		if (/*theme*/ ctx[4] === undefined && !("theme" in props)) {
    			console.warn("<NavBar> was created without expected prop 'theme'");
    		}
    	}

    	get page() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get theme() {
    		throw new Error("<NavBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<NavBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.37.0 */

    // (15:0) <MaterialAppMin {theme}>
    function create_default_slot(ctx) {
    	let navbar;
    	let updating_page;
    	let updating_theme;
    	let t;
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	function navbar_page_binding(value) {
    		/*navbar_page_binding*/ ctx[2](value);
    	}

    	function navbar_theme_binding(value) {
    		/*navbar_theme_binding*/ ctx[3](value);
    	}

    	let navbar_props = {};

    	if (/*page*/ ctx[1] !== void 0) {
    		navbar_props.page = /*page*/ ctx[1];
    	}

    	if (/*theme*/ ctx[0] !== void 0) {
    		navbar_props.theme = /*theme*/ ctx[0];
    	}

    	navbar = new NavBar({ props: navbar_props, $$inline: true });
    	binding_callbacks.push(() => bind(navbar, "page", navbar_page_binding));
    	binding_callbacks.push(() => bind(navbar, "theme", navbar_theme_binding));
    	var switch_value = /*page*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t = space();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navbar_changes = {};

    			if (!updating_page && dirty & /*page*/ 2) {
    				updating_page = true;
    				navbar_changes.page = /*page*/ ctx[1];
    				add_flush_callback(() => updating_page = false);
    			}

    			if (!updating_theme && dirty & /*theme*/ 1) {
    				updating_theme = true;
    				navbar_changes.theme = /*theme*/ ctx[0];
    				add_flush_callback(() => updating_theme = false);
    			}

    			navbar.$set(navbar_changes);

    			if (switch_value !== (switch_value = /*page*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(15:0) <MaterialAppMin {theme}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let materialappmin;
    	let current;

    	materialappmin = new MaterialAppMin({
    			props: {
    				theme: /*theme*/ ctx[0],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(materialappmin.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(materialappmin, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const materialappmin_changes = {};
    			if (dirty & /*theme*/ 1) materialappmin_changes.theme = /*theme*/ ctx[0];

    			if (dirty & /*$$scope, page, theme*/ 19) {
    				materialappmin_changes.$$scope = { dirty, ctx };
    			}

    			materialappmin.$set(materialappmin_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(materialappmin.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(materialappmin.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(materialappmin, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let page = Home;
    	let theme = localStorage.getItem("theme") || "light";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function navbar_page_binding(value) {
    		page = value;
    		$$invalidate(1, page);
    	}

    	function navbar_theme_binding(value) {
    		theme = value;
    		$$invalidate(0, theme);
    	}

    	$$self.$capture_state = () => ({
    		MaterialAppMin,
    		NavBar,
    		Home,
    		page,
    		theme
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(1, page = $$props.page);
    		if ("theme" in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*theme*/ 1) {
    			{
    				if (theme) {
    					localStorage.setItem("theme", theme);
    				}
    			}
    		}
    	};

    	return [theme, page, navbar_page_binding, navbar_theme_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
