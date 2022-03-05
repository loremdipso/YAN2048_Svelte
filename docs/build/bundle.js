
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
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

    /* src/common/GithubCorner.svelte generated by Svelte v3.46.2 */

    const file$c = "src/common/GithubCorner.svelte";

    function create_fragment$d(ctx) {
    	let a;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "class", "background");
    			attr_dev(path0, "d", "M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z");
    			add_location(path0, file$c, 17, 2, 460);
    			attr_dev(path1, "d", "M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2");
    			attr_dev(path1, "fill", "currentColor");
    			set_style(path1, "transform-origin", "130px 106px");
    			attr_dev(path1, "class", "octo-arm svelte-1rr76ng");
    			add_location(path1, file$c, 21, 2, 552);
    			attr_dev(path2, "d", "M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z");
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "class", "octo-body");
    			add_location(path2, file$c, 27, 2, 841);
    			attr_dev(svg, "width", "80");
    			attr_dev(svg, "height", "80");
    			attr_dev(svg, "viewBox", "0 0 250 250");
    			attr_dev(svg, "aria-hidden", "true");
    			set_style(svg, "fill", /*fill*/ ctx[1]);
    			attr_dev(svg, "class", svg_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-1rr76ng"));
    			add_location(svg, file$c, 9, 1, 337);
    			attr_dev(a, "href", /*href*/ ctx[0]);
    			attr_dev(a, "target", "#");
    			attr_dev(a, "class", "github-corner svelte-1rr76ng");
    			attr_dev(a, "aria-label", "View source on GitHub");
    			add_location(a, file$c, 8, 0, 257);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fill*/ 2) {
    				set_style(svg, "fill", /*fill*/ ctx[1]);
    			}

    			if (dirty & /*classes*/ 4 && svg_class_value !== (svg_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-1rr76ng"))) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (dirty & /*href*/ 1) {
    				attr_dev(a, "href", /*href*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
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
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GithubCorner', slots, []);
    	let { href } = $$props;
    	let { position = "topRight" } = $$props;
    	let { fill = "#ff2768" } = $$props;
    	let { small = false } = $$props;
    	const writable_props = ['href', 'position', 'fill', 'small'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GithubCorner> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('position' in $$props) $$invalidate(3, position = $$props.position);
    		if ('fill' in $$props) $$invalidate(1, fill = $$props.fill);
    		if ('small' in $$props) $$invalidate(4, small = $$props.small);
    	};

    	$$self.$capture_state = () => ({ href, position, fill, small, classes });

    	$$self.$inject_state = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('position' in $$props) $$invalidate(3, position = $$props.position);
    		if ('fill' in $$props) $$invalidate(1, fill = $$props.fill);
    		if ('small' in $$props) $$invalidate(4, small = $$props.small);
    		if ('classes' in $$props) $$invalidate(2, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*position, small*/ 24) {
    			$$invalidate(2, classes = `${position}${small ? " small" : ""}`);
    		}
    	};

    	return [href, fill, classes, position, small];
    }

    class GithubCorner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { href: 0, position: 3, fill: 1, small: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GithubCorner",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*href*/ ctx[0] === undefined && !('href' in props)) {
    			console.warn("<GithubCorner> was created without expected prop 'href'");
    		}
    	}

    	get href() {
    		throw new Error("<GithubCorner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<GithubCorner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<GithubCorner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<GithubCorner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fill() {
    		throw new Error("<GithubCorner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fill(value) {
    		throw new Error("<GithubCorner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<GithubCorner>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<GithubCorner>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/common/Installer.svelte generated by Svelte v3.46.2 */

    const { console: console_1 } = globals;
    const file$b = "src/common/Installer.svelte";

    // (49:0) {#if show_install_button && deferred_prompt}
    function create_if_block$3(ctx) {
    	let div;
    	let button0;
    	let t0;
    	let t1;
    	let button1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button0 = element("button");
    			t0 = text("install");
    			t1 = space();
    			button1 = element("button");
    			t2 = text("X");
    			attr_dev(button0, "class", "" + (null_to_empty(button_classes) + " svelte-1r90fl7"));
    			add_location(button0, file$b, 50, 2, 1933);
    			attr_dev(button1, "class", "" + (null_to_empty(button_classes) + " svelte-1r90fl7"));
    			add_location(button1, file$b, 53, 2, 2017);
    			attr_dev(div, "class", "installer slide-in-from-bottom p-2 flex rounded-full svelte-1r90fl7");
    			add_location(div, file$b, 49, 1, 1864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button0);
    			append_dev(button0, t0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(button1, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(49:0) {#if show_install_button && deferred_prompt}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let if_block = /*show_install_button*/ ctx[0] && /*deferred_prompt*/ ctx[1] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show_install_button*/ ctx[0] && /*deferred_prompt*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const button_classes = "false flex items-center justify-center gap-1 font-bold outline-none uppercase tracking-wider focus:outline-none focus:shadow-none transition-all duration-300 rounded-full py-2.5 px-6 text-xs leading-normal bg-transparent border border-solid shadow-none text-light-blue-500 border-light-blue-500 hover:bg-light-blue-50 hover:border-light-blue-700 hover:text-light-blue-700 hover:bg-light-blue-50 active:bg-light-blue-100";

    function getPWADisplayMode() {
    	const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    	if (document.referrer.startsWith("android-app://")) {
    		return "twa";
    	} else if (navigator.standalone || isStandalone) {
    		return "standalone";
    	}

    	return "browser";
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Installer', slots, []);
    	let show_install_button = getPWADisplayMode() === "browser";
    	let deferred_prompt;

    	onMount(() => {

    		// see if we can install in this context
    		window.addEventListener("beforeinstallprompt", e => {
    			e.preventDefault();
    			$$invalidate(1, deferred_prompt = e);
    		});
    	});

    	function install() {
    		$$invalidate(0, show_install_button = false);

    		if (deferred_prompt) {
    			deferred_prompt.prompt();

    			deferred_prompt.userChoice.then(choice => {
    				if (choice.outcome === "accepted") {
    					console.log("yay!");
    				}

    				$$invalidate(1, deferred_prompt = null);
    			});
    		}
    	}

    	function close() {
    		$$invalidate(0, show_install_button = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Installer> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => install();
    	const click_handler_1 = () => close();

    	$$self.$capture_state = () => ({
    		onMount,
    		getPWADisplayMode,
    		show_install_button,
    		deferred_prompt,
    		install,
    		close,
    		button_classes
    	});

    	$$self.$inject_state = $$props => {
    		if ('show_install_button' in $$props) $$invalidate(0, show_install_button = $$props.show_install_button);
    		if ('deferred_prompt' in $$props) $$invalidate(1, deferred_prompt = $$props.deferred_prompt);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		show_install_button,
    		deferred_prompt,
    		install,
    		close,
    		click_handler,
    		click_handler_1
    	];
    }

    class Installer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Installer",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    // Thanks https://stackoverflow.com/a/12646864 !!!
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    function getRandomElement(arr) {
        return arr[getRandomInt(0, arr.length) % arr.length];
    }
    function getRandomInt(min, maxExclusive) {
        return min + Math.floor(Math.random() * maxExclusive);
    }

    const newCellValues = [1, 2];
    function generateCells(totalCells, nonEmptyCells) {
        let cells = [];
        for (let i = 0; i < totalCells; i++) {
            if (i < nonEmptyCells) {
                cells.push(generateRandomCell());
            }
            else {
                cells.push(generateEmptyCell());
            }
        }
        shuffleArray(cells);
        return cells;
    }
    function generateEmptyCell() {
        return {
            id: getCellId(),
            value: 0
        };
    }
    function generateRandomCell() {
        return {
            id: getCellId(),
            value: getRandomStartingValue(),
        };
    }
    function getRandomStartingValue() {
        return getRandomElement(newCellValues);
    }
    const getCellId = (() => {
        let id = 0;
        return () => {
            return id++;
        };
    })();
    const COLORS = [
        "#79867c",
        "#926d6f",
        "#9c1ce3",
        "#4f0af5",
        "#18a1e7",
        "#3e66c1",
        "#9edb24",
        "#48c639",
        "#ead515",
        "#f96d06",
        "#ff0700",
        "#ff00cc"
        // "#001f3f",
        // "#0074D9",
        // "#7FDBFF",
        // "#39CCCC",
        // "#3D9970",
        // "#2ECC40",
        // "#01FF70",
        // "#FFDC00",
        // "#FF851B",
        // "#FF4136",
        // "#85144b",
        // "#F012BE",
        // "#B10DC9",
        // "#111111",
        // "#AAAAAA",
        // "#DDDDDD"
    ];
    function valueToColor(value) {
        return COLORS[value % COLORS.length];
    }

    /* node_modules/smelte/src/components/Icon/Icon.svelte generated by Svelte v3.46.2 */

    const file$a = "node_modules/smelte/src/components/Icon/Icon.svelte";

    function create_fragment$b(ctx) {
    	let i;
    	let i_class_value;
    	let i_style_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			i = element("i");
    			if (default_slot) default_slot.c();
    			attr_dev(i, "aria-hidden", "true");
    			attr_dev(i, "class", i_class_value = "material-icons icon text-xl select-none " + /*$$props*/ ctx[5].class + " duration-200 ease-in" + " svelte-1bygq4a");
    			attr_dev(i, "style", i_style_value = /*color*/ ctx[4] ? `color: ${/*color*/ ctx[4]}` : '');
    			toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			toggle_class(i, "tip", /*tip*/ ctx[3]);
    			toggle_class(i, "text-base", /*small*/ ctx[0]);
    			toggle_class(i, "text-xs", /*xs*/ ctx[1]);
    			add_location(i, file$a, 21, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);

    			if (default_slot) {
    				default_slot.m(i, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(i, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$$props*/ 32 && i_class_value !== (i_class_value = "material-icons icon text-xl select-none " + /*$$props*/ ctx[5].class + " duration-200 ease-in" + " svelte-1bygq4a")) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (!current || dirty & /*color*/ 16 && i_style_value !== (i_style_value = /*color*/ ctx[4] ? `color: ${/*color*/ ctx[4]}` : '')) {
    				attr_dev(i, "style", i_style_value);
    			}

    			if (dirty & /*$$props, reverse*/ 36) {
    				toggle_class(i, "reverse", /*reverse*/ ctx[2]);
    			}

    			if (dirty & /*$$props, tip*/ 40) {
    				toggle_class(i, "tip", /*tip*/ ctx[3]);
    			}

    			if (dirty & /*$$props, small*/ 33) {
    				toggle_class(i, "text-base", /*small*/ ctx[0]);
    			}

    			if (dirty & /*$$props, xs*/ 34) {
    				toggle_class(i, "text-xs", /*xs*/ ctx[1]);
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
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, ['default']);
    	let { small = false } = $$props;
    	let { xs = false } = $$props;
    	let { reverse = false } = $$props;
    	let { tip = false } = $$props;
    	let { color = "default" } = $$props;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('small' in $$new_props) $$invalidate(0, small = $$new_props.small);
    		if ('xs' in $$new_props) $$invalidate(1, xs = $$new_props.xs);
    		if ('reverse' in $$new_props) $$invalidate(2, reverse = $$new_props.reverse);
    		if ('tip' in $$new_props) $$invalidate(3, tip = $$new_props.tip);
    		if ('color' in $$new_props) $$invalidate(4, color = $$new_props.color);
    		if ('$$scope' in $$new_props) $$invalidate(6, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ small, xs, reverse, tip, color });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(5, $$props = assign(assign({}, $$props), $$new_props));
    		if ('small' in $$props) $$invalidate(0, small = $$new_props.small);
    		if ('xs' in $$props) $$invalidate(1, xs = $$new_props.xs);
    		if ('reverse' in $$props) $$invalidate(2, reverse = $$new_props.reverse);
    		if ('tip' in $$props) $$invalidate(3, tip = $$new_props.tip);
    		if ('color' in $$props) $$invalidate(4, color = $$new_props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [small, xs, reverse, tip, color, $$props, $$scope, slots, click_handler];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			small: 0,
    			xs: 1,
    			reverse: 2,
    			tip: 3,
    			color: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get small() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xs() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xs(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reverse() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reverse(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tip() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tip(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/GameButton.svelte generated by Svelte v3.46.2 */
    const file$9 = "src/components/GameButton.svelte";

    // (18:1) <Icon {color}>
    function create_default_slot$4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*icon*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*icon*/ 1) set_data_dev(t, /*icon*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(18:1) <Icon {color}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let icon_1;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	icon_1 = new Icon({
    			props: {
    				color: /*color*/ ctx[3],
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(icon_1.$$.fragment);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*classes*/ ctx[4]) + " svelte-1men00k"));
    			set_style(div, "background-color", /*backgroundColor*/ ctx[2]);
    			attr_dev(div, "title", /*title*/ ctx[1]);
    			add_location(div, file$9, 11, 0, 335);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(icon_1, div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const icon_1_changes = {};
    			if (dirty & /*color*/ 8) icon_1_changes.color = /*color*/ ctx[3];

    			if (dirty & /*$$scope, icon*/ 257) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);

    			if (!current || dirty & /*classes*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty(/*classes*/ ctx[4]) + " svelte-1men00k"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty & /*backgroundColor*/ 4) {
    				set_style(div, "background-color", /*backgroundColor*/ ctx[2]);
    			}

    			if (!current || dirty & /*title*/ 2) {
    				attr_dev(div, "title", /*title*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(icon_1);
    			mounted = false;
    			dispose();
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
    	let classes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GameButton', slots, []);
    	const dispatch = createEventDispatcher();
    	let { icon } = $$props;
    	let { title = "" } = $$props;
    	let { grow = false } = $$props;
    	let { backgroundColor = "black" } = $$props;
    	let { color = "white" } = $$props;
    	const writable_props = ['icon', 'title', 'grow', 'backgroundColor', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GameButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("click");

    	$$self.$$set = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('grow' in $$props) $$invalidate(6, grow = $$props.grow);
    		if ('backgroundColor' in $$props) $$invalidate(2, backgroundColor = $$props.backgroundColor);
    		if ('color' in $$props) $$invalidate(3, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		Icon,
    		icon,
    		title,
    		grow,
    		backgroundColor,
    		color,
    		classes
    	});

    	$$self.$inject_state = $$props => {
    		if ('icon' in $$props) $$invalidate(0, icon = $$props.icon);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    		if ('grow' in $$props) $$invalidate(6, grow = $$props.grow);
    		if ('backgroundColor' in $$props) $$invalidate(2, backgroundColor = $$props.backgroundColor);
    		if ('color' in $$props) $$invalidate(3, color = $$props.color);
    		if ('classes' in $$props) $$invalidate(4, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*grow*/ 64) {
    			$$invalidate(4, classes = grow ? "flex-grow" : "");
    		}
    	};

    	return [icon, title, backgroundColor, color, classes, dispatch, grow, click_handler];
    }

    class GameButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			icon: 0,
    			title: 1,
    			grow: 6,
    			backgroundColor: 2,
    			color: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameButton",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*icon*/ ctx[0] === undefined && !('icon' in props)) {
    			console.warn("<GameButton> was created without expected prop 'icon'");
    		}
    	}

    	get icon() {
    		throw new Error("<GameButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<GameButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<GameButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<GameButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grow() {
    		throw new Error("<GameButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grow(value) {
    		throw new Error("<GameButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backgroundColor() {
    		throw new Error("<GameButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backgroundColor(value) {
    		throw new Error("<GameButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<GameButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<GameButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Cell.svelte generated by Svelte v3.46.2 */
    const file$8 = "src/components/Cell.svelte";

    // (32:1) {:else}
    function create_else_block$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "cell empty svelte-nuarbl");
    			add_location(div, file$8, 32, 2, 718);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(32:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:1) {#if cell.value > 0}
    function create_if_block$2(ctx) {
    	let div;
    	let t_value = /*cell*/ ctx[0].value + "";
    	let t;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*classes*/ ctx[1]) + " svelte-nuarbl"));
    			attr_dev(div, "style", /*styles*/ ctx[2]);
    			add_location(div, file$8, 28, 2, 645);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*cell*/ 1 && t_value !== (t_value = /*cell*/ ctx[0].value + "")) set_data_dev(t, t_value);

    			if (dirty & /*classes*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(/*classes*/ ctx[1]) + " svelte-nuarbl"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*styles*/ 4) {
    				attr_dev(div, "style", /*styles*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(28:1) {#if cell.value > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*cell*/ ctx[0].value > 0) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "container svelte-nuarbl");
    			add_location(div, file$8, 26, 0, 597);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
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
    	let color;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cell', slots, []);
    	let { cell } = $$props;
    	let { cellSize } = $$props;
    	let classes;
    	let styles;
    	const writable_props = ['cell', 'cellSize'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cell> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('cell' in $$props) $$invalidate(0, cell = $$props.cell);
    		if ('cellSize' in $$props) $$invalidate(3, cellSize = $$props.cellSize);
    	};

    	$$self.$capture_state = () => ({
    		valueToColor,
    		cell,
    		cellSize,
    		classes,
    		styles,
    		color
    	});

    	$$self.$inject_state = $$props => {
    		if ('cell' in $$props) $$invalidate(0, cell = $$props.cell);
    		if ('cellSize' in $$props) $$invalidate(3, cellSize = $$props.cellSize);
    		if ('classes' in $$props) $$invalidate(1, classes = $$props.classes);
    		if ('styles' in $$props) $$invalidate(2, styles = $$props.styles);
    		if ('color' in $$props) $$invalidate(4, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*cell*/ 1) {
    			$$invalidate(4, color = valueToColor(cell.value));
    		}

    		if ($$self.$$.dirty & /*cell, classes, cellSize*/ 11) {
    			{
    				$$invalidate(1, classes = "cell");

    				if (cell.shouldAppear) {
    					$$invalidate(1, classes = $$invalidate(1, classes += " tile-new"));
    				}

    				if (cell.wasMerged) {
    					$$invalidate(1, classes += " tile-merged");
    				}

    				if (cell.value >= 1000 && cellSize > 5) {
    					$$invalidate(1, classes += " four-digits");
    				}

    				(($$invalidate(1, classes), $$invalidate(0, cell)), $$invalidate(3, cellSize));
    			}
    		}

    		if ($$self.$$.dirty & /*cellSize, color*/ 24) {
    			{
    				let tempStyles = `font-size: ${cellSize}vmin;`;
    				tempStyles += `background-color: ${color};`;
    				$$invalidate(2, styles = tempStyles);
    			}
    		}
    	};

    	return [cell, classes, styles, cellSize, color];
    }

    class Cell extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { cell: 0, cellSize: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cell",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cell*/ ctx[0] === undefined && !('cell' in props)) {
    			console.warn("<Cell> was created without expected prop 'cell'");
    		}

    		if (/*cellSize*/ ctx[3] === undefined && !('cellSize' in props)) {
    			console.warn("<Cell> was created without expected prop 'cellSize'");
    		}
    	}

    	get cell() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cell(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cellSize() {
    		throw new Error("<Cell>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cellSize(value) {
    		throw new Error("<Cell>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const MIN_THRESHOLD = 1;
    // modified from https://stackoverflow.com/a/56663695
    class Swiper {
        constructor(element, callback, config) {
            this.element = element;
            this.callback = callback;
            this.config = {
                threshold: MIN_THRESHOLD
            };
            this.listeners = {};
            this.touchStartX = 0;
            this.touchEndX = 0;
            this.touchStartY = 0;
            this.touchEndY = 0;
            if (config) {
                this.config = Object.assign({}, config);
            }
            this.config.threshold = Math.max(this.config.threshold, MIN_THRESHOLD);
            this.start();
        }
        stop() {
            // TODO: test if it's still in the DOM?
            if (this.element) {
                this.removeEventListeners();
            }
        }
        // TODO: figure out the right typings here
        addEventListener(key, cb) {
            this.element.addEventListener(key, cb);
            if (!this.listeners[key]) {
                this.listeners[key] = [cb];
            }
            else {
                this.listeners[key].push(cb);
            }
        }
        removeEventListeners() {
            // TODO: is this right?
            for (const key in this.listeners) {
                if (this.listeners.hasOwnProperty(key)) {
                    const arr = this.listeners[key];
                    for (const cb of arr) {
                        this.element.removeEventListener(key, cb);
                    }
                }
            }
        }
        start() {
            this.addEventListener('touchstart', e => {
                this.touchStartX = e.changedTouches[0].screenX;
                this.touchStartY = e.changedTouches[0].screenY;
                e.preventDefault();
            });
            this.addEventListener('touchend', e => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.touchEndY = e.changedTouches[0].screenY;
                this.handleGesture();
                e.preventDefault();
            });
        }
        handleGesture() {
            let xDelta = this.touchEndX - this.touchStartX;
            let yDelta = this.touchEndY - this.touchStartY;
            let xDeltaAbs = Math.abs(xDelta);
            let yDeltaAbs = Math.abs(yDelta);
            if (xDeltaAbs > this.config.threshold || yDeltaAbs > this.config.threshold) {
                if (xDeltaAbs > yDeltaAbs) {
                    if (xDelta > 0) {
                        this.callback("right");
                    }
                    else {
                        this.callback("left");
                    }
                }
                else {
                    if (yDelta > 0) {
                        this.callback("down");
                    }
                    else {
                        this.callback("up");
                    }
                }
            }
        }
    }

    /* src/components/Board.svelte generated by Svelte v3.46.2 */
    const file$7 = "src/components/Board.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    // (77:3) {#each cells as cell (cell.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let cell;
    	let current;

    	cell = new Cell({
    			props: {
    				cellSize: /*cellSize*/ ctx[2],
    				cell: /*cell*/ ctx[17]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(cell.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(cell, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const cell_changes = {};
    			if (dirty & /*cellSize*/ 4) cell_changes.cellSize = /*cellSize*/ ctx[2];
    			if (dirty & /*cells*/ 1) cell_changes.cell = /*cell*/ ctx[17];
    			cell.$set(cell_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cell.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cell.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(cell, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(77:3) {#each cells as cell (cell.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div4;
    	let div0;
    	let gamebutton0;
    	let t0;
    	let gamebutton1;
    	let t1;
    	let gamebutton2;
    	let t2;
    	let div2;
    	let gamebutton3;
    	let t3;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t4;
    	let gamebutton4;
    	let t5;
    	let div3;
    	let gamebutton5;
    	let t6;
    	let gamebutton6;
    	let t7;
    	let gamebutton7;
    	let current;

    	gamebutton0 = new GameButton({
    			props: {
    				icon: "info",
    				title: "Show info",
    				color: "black",
    				backgroundColor: "white"
    			},
    			$$inline: true
    		});

    	gamebutton0.$on("click", /*click_handler*/ ctx[8]);

    	gamebutton1 = new GameButton({
    			props: { grow: true, icon: "expand_less" },
    			$$inline: true
    		});

    	gamebutton1.$on("click", /*click_handler_1*/ ctx[9]);

    	gamebutton2 = new GameButton({
    			props: {
    				icon: "refresh",
    				title: "Restart",
    				color: "black",
    				backgroundColor: "white"
    			},
    			$$inline: true
    		});

    	gamebutton2.$on("click", /*click_handler_2*/ ctx[10]);

    	gamebutton3 = new GameButton({
    			props: { icon: "chevron_left" },
    			$$inline: true
    		});

    	gamebutton3.$on("click", /*click_handler_3*/ ctx[11]);
    	let each_value = /*cells*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*cell*/ ctx[17].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	gamebutton4 = new GameButton({
    			props: { icon: "chevron_right" },
    			$$inline: true
    		});

    	gamebutton4.$on("click", /*click_handler_4*/ ctx[13]);

    	gamebutton5 = new GameButton({
    			props: {
    				icon: "remove",
    				title: "Shrink board",
    				color: "black",
    				backgroundColor: "white"
    			},
    			$$inline: true
    		});

    	gamebutton5.$on("click", /*click_handler_5*/ ctx[14]);

    	gamebutton6 = new GameButton({
    			props: { grow: true, icon: "expand_more" },
    			$$inline: true
    		});

    	gamebutton6.$on("click", /*click_handler_6*/ ctx[15]);

    	gamebutton7 = new GameButton({
    			props: {
    				icon: "add",
    				title: "Grow board",
    				color: "black",
    				backgroundColor: "white"
    			},
    			$$inline: true
    		});

    	gamebutton7.$on("click", /*click_handler_7*/ ctx[16]);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(gamebutton0.$$.fragment);
    			t0 = space();
    			create_component(gamebutton1.$$.fragment);
    			t1 = space();
    			create_component(gamebutton2.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(gamebutton3.$$.fragment);
    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			create_component(gamebutton4.$$.fragment);
    			t5 = space();
    			div3 = element("div");
    			create_component(gamebutton5.$$.fragment);
    			t6 = space();
    			create_component(gamebutton6.$$.fragment);
    			t7 = space();
    			create_component(gamebutton7.$$.fragment);
    			attr_dev(div0, "class", "flex full-w");
    			add_location(div0, file$7, 56, 1, 1348);
    			attr_dev(div1, "class", "cells svelte-vu2b0v");
    			attr_dev(div1, "style", /*cellsStyles*/ ctx[3]);
    			add_location(div1, file$7, 75, 2, 1837);
    			attr_dev(div2, "class", "center-region svelte-vu2b0v");
    			add_location(div2, file$7, 73, 1, 1736);
    			attr_dev(div3, "class", "flex full-w");
    			add_location(div3, file$7, 82, 1, 2066);
    			attr_dev(div4, "class", "board ml-auto mr-auto svelte-vu2b0v");
    			add_location(div4, file$7, 55, 0, 1311);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(gamebutton0, div0, null);
    			append_dev(div0, t0);
    			mount_component(gamebutton1, div0, null);
    			append_dev(div0, t1);
    			mount_component(gamebutton2, div0, null);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			mount_component(gamebutton3, div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			/*div1_binding*/ ctx[12](div1);
    			append_dev(div2, t4);
    			mount_component(gamebutton4, div2, null);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			mount_component(gamebutton5, div3, null);
    			append_dev(div3, t6);
    			mount_component(gamebutton6, div3, null);
    			append_dev(div3, t7);
    			mount_component(gamebutton7, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cellSize, cells*/ 5) {
    				each_value = /*cells*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}

    			if (!current || dirty & /*cellsStyles*/ 8) {
    				attr_dev(div1, "style", /*cellsStyles*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamebutton0.$$.fragment, local);
    			transition_in(gamebutton1.$$.fragment, local);
    			transition_in(gamebutton2.$$.fragment, local);
    			transition_in(gamebutton3.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(gamebutton4.$$.fragment, local);
    			transition_in(gamebutton5.$$.fragment, local);
    			transition_in(gamebutton6.$$.fragment, local);
    			transition_in(gamebutton7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamebutton0.$$.fragment, local);
    			transition_out(gamebutton1.$$.fragment, local);
    			transition_out(gamebutton2.$$.fragment, local);
    			transition_out(gamebutton3.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(gamebutton4.$$.fragment, local);
    			transition_out(gamebutton5.$$.fragment, local);
    			transition_out(gamebutton6.$$.fragment, local);
    			transition_out(gamebutton7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(gamebutton0);
    			destroy_component(gamebutton1);
    			destroy_component(gamebutton2);
    			destroy_component(gamebutton3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			/*div1_binding*/ ctx[12](null);
    			destroy_component(gamebutton4);
    			destroy_component(gamebutton5);
    			destroy_component(gamebutton6);
    			destroy_component(gamebutton7);
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

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Board', slots, []);
    	const dispatch = createEventDispatcher();
    	let { cells } = $$props;
    	let { numCols } = $$props;
    	let { numRows } = $$props;
    	let cellsDiv;
    	let swiper;
    	let cellSize = 7;
    	let cellsStyles;
    	const writable_props = ['cells', 'numCols', 'numRows'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("showInfo");
    	const click_handler_1 = () => dispatch("up");
    	const click_handler_2 = () => dispatch("restart");
    	const click_handler_3 = () => dispatch("left");

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cellsDiv = $$value;
    			$$invalidate(1, cellsDiv);
    		});
    	}

    	const click_handler_4 = () => dispatch("right");
    	const click_handler_5 = () => dispatch("shrink");
    	const click_handler_6 = () => dispatch("down");
    	const click_handler_7 = () => dispatch("grow");

    	$$self.$$set = $$props => {
    		if ('cells' in $$props) $$invalidate(0, cells = $$props.cells);
    		if ('numCols' in $$props) $$invalidate(5, numCols = $$props.numCols);
    		if ('numRows' in $$props) $$invalidate(6, numRows = $$props.numRows);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		GameButton,
    		Cell,
    		Swiper,
    		cells,
    		numCols,
    		numRows,
    		cellsDiv,
    		swiper,
    		cellSize,
    		cellsStyles
    	});

    	$$self.$inject_state = $$props => {
    		if ('cells' in $$props) $$invalidate(0, cells = $$props.cells);
    		if ('numCols' in $$props) $$invalidate(5, numCols = $$props.numCols);
    		if ('numRows' in $$props) $$invalidate(6, numRows = $$props.numRows);
    		if ('cellsDiv' in $$props) $$invalidate(1, cellsDiv = $$props.cellsDiv);
    		if ('swiper' in $$props) $$invalidate(7, swiper = $$props.swiper);
    		if ('cellSize' in $$props) $$invalidate(2, cellSize = $$props.cellSize);
    		if ('cellsStyles' in $$props) $$invalidate(3, cellsStyles = $$props.cellsStyles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*swiper, cellsDiv*/ 130) {
    			{
    				// TODO: handle cleanup better, maybe
    				if (swiper) {
    					swiper.stop();
    				}

    				if (cellsDiv) {
    					$$invalidate(7, swiper = new Swiper(cellsDiv,
    					direction => {
    							dispatch(direction);
    						}));
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*numCols, numRows*/ 96) {
    			{
    				let tempStyles = "grid-template-columns:";

    				for (let i = 0; i < numCols; i++) {
    					tempStyles += "minmax(0, 1fr)";
    				}

    				tempStyles += ";grid-template-rows:";

    				for (let i = 0; i < numRows; i++) {
    					tempStyles += "minmax(0, 1fr)";
    				}

    				let spacing = 1;
    				let numCells = numRows * numCols;

    				if (numCells < 36) {
    					spacing = 10;
    				} else if (numCells < 64) {
    					spacing = 5;
    				} else if (numCells < 81) {
    					spacing = 4;
    					$$invalidate(2, cellSize = 5);
    				} else if (numCells < 144) {
    					$$invalidate(2, cellSize = 2);
    				} else if (numCells < 676) {
    					$$invalidate(2, cellSize = 1);
    				}

    				tempStyles += `;padding: ${spacing}px; gap: ${spacing}px;`;
    				$$invalidate(3, cellsStyles = tempStyles);
    			}
    		}
    	};

    	return [
    		cells,
    		cellsDiv,
    		cellSize,
    		cellsStyles,
    		dispatch,
    		numCols,
    		numRows,
    		swiper,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		div1_binding,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7
    	];
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { cells: 0, numCols: 5, numRows: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cells*/ ctx[0] === undefined && !('cells' in props)) {
    			console.warn("<Board> was created without expected prop 'cells'");
    		}

    		if (/*numCols*/ ctx[5] === undefined && !('numCols' in props)) {
    			console.warn("<Board> was created without expected prop 'numCols'");
    		}

    		if (/*numRows*/ ctx[6] === undefined && !('numRows' in props)) {
    			console.warn("<Board> was created without expected prop 'numRows'");
    		}
    	}

    	get cells() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cells(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numCols() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numCols(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numRows() {
    		throw new Error("<Board>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numRows(value) {
    		throw new Error("<Board>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const noDepth = ["white", "black", "transparent"];

    function getClass(prop, color, depth, defaultDepth) {
      if (noDepth.includes(color)) {
        return `${prop}-${color}`;
      }
      return `${prop}-${color}-${depth || defaultDepth} `;
    }

    function utils(color, defaultDepth = 500) {
      return {
        bg: depth => getClass("bg", color, depth, defaultDepth),
        border: depth => getClass("border", color, depth, defaultDepth),
        txt: depth => getClass("text", color, depth, defaultDepth),
        caret: depth => getClass("caret", color, depth, defaultDepth)
      };
    }

    class ClassBuilder {
      constructor(classes, defaultClasses) {
        this.defaults =
          (typeof classes === "function" ? classes(defaultClasses) : classes) ||
          defaultClasses;

        this.classes = this.defaults;
      }

      flush() {
        this.classes = this.defaults;

        return this;
      }

      extend(...fns) {
        return this;
      }

      get() {
        return this.classes;
      }

      replace(classes, cond = true) {
        if (cond && classes) {
          this.classes = Object.keys(classes).reduce(
            (acc, from) => acc.replace(new RegExp(from, "g"), classes[from]),
            this.classes
          );
        }

        return this;
      }

      remove(classes, cond = true) {
        if (cond && classes) {
          this.classes = classes
            .split(" ")
            .reduce(
              (acc, cur) => acc.replace(new RegExp(cur, "g"), ""),
              this.classes
            );
        }

        return this;
      }

      add(className, cond = true, defaultValue) {
        if (!cond || !className) return this;

        switch (typeof className) {
          case "string":
          default:
            this.classes += ` ${className} `;
            return this;
          case "function":
            this.classes += ` ${className(defaultValue || this.classes)} `;
            return this;
        }
      }
    }

    const defaultReserved = ["class", "add", "remove", "replace", "value"];

    function filterProps(reserved, props) {
      const r = [...reserved, ...defaultReserved];

      return Object.keys(props).reduce(
        (acc, cur) =>
          cur.includes("$$") || cur.includes("Class") || r.includes(cur)
            ? acc
            : { ...acc, [cur]: props[cur] },
        {}
      );
    }

    // Thanks Lagden! https://svelte.dev/repl/61d9178d2b9944f2aa2bfe31612ab09f?version=3.6.7
    function ripple(color, centered) {
      return function(event) {
        const target = event.currentTarget;
        const circle = document.createElement("span");
        const d = Math.max(target.clientWidth, target.clientHeight);

        const removeCircle = () => {
          circle.remove();
          circle.removeEventListener("animationend", removeCircle);
        };

        circle.addEventListener("animationend", removeCircle);
        circle.style.width = circle.style.height = `${d}px`;
        const rect = target.getBoundingClientRect();

        if (centered) {
          circle.classList.add(
            "absolute",
            "top-0",
            "left-0",
            "ripple-centered",
            `bg-${color}-transDark`
          );
        } else {
          circle.style.left = `${event.clientX - rect.left - d / 2}px`;
          circle.style.top = `${event.clientY - rect.top - d / 2}px`;

          circle.classList.add("ripple-normal", `bg-${color}-trans`);
        }

        circle.classList.add("ripple");

        target.appendChild(circle);
      };
    }

    function r(color = "primary", centered = false) {
      return function(node) {
        const onMouseDown = ripple(color, centered);
        node.addEventListener("mousedown", onMouseDown);

        return {
          onDestroy: () => node.removeEventListener("mousedown", onMouseDown),
        };
      };
    }

    /* node_modules/smelte/src/components/Button/Button.svelte generated by Svelte v3.46.2 */
    const file$6 = "node_modules/smelte/src/components/Button/Button.svelte";

    // (153:0) {:else}
    function create_else_block(ctx) {
    	let button;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[3] && create_if_block_2(ctx);
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);

    	let button_levels = [
    		{ class: /*classes*/ ctx[1] },
    		/*props*/ ctx[9],
    		{ type: /*type*/ ctx[6] },
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$6, 153, 2, 4075);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*ripple*/ ctx[8].call(null, button)),
    					listen_dev(button, "click", /*click_handler_3*/ ctx[42], false, false, false),
    					listen_dev(button, "click", /*click_handler_1*/ ctx[38], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler_1*/ ctx[39], false, false, false),
    					listen_dev(button, "*", /*_handler_1*/ ctx[40], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[43], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*classes*/ 2) && { class: /*classes*/ ctx[1] },
    				/*props*/ ctx[9],
    				(!current || dirty[0] & /*type*/ 64) && { type: /*type*/ ctx[6] },
    				(!current || dirty[0] & /*disabled*/ 4) && { disabled: /*disabled*/ ctx[2] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block.name,
    		type: "else",
    		source: "(153:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (131:0) {#if href}
    function create_if_block$1(ctx) {
    	let a;
    	let button;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*icon*/ ctx[3] && create_if_block_1(ctx);
    	const default_slot_template = /*#slots*/ ctx[34].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[43], null);

    	let button_levels = [
    		{ class: /*classes*/ ctx[1] },
    		/*props*/ ctx[9],
    		{ type: /*type*/ ctx[6] },
    		{ disabled: /*disabled*/ ctx[2] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	let a_levels = [{ href: /*href*/ ctx[5] }, /*props*/ ctx[9]];
    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			button = element("button");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			set_attributes(button, button_data);
    			add_location(button, file$6, 135, 4, 3762);
    			set_attributes(a, a_data);
    			add_location(a, file$6, 131, 2, 3725);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, button);
    			if (if_block) if_block.m(button, null);
    			append_dev(button, t);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			if (button.autofocus) button.focus();
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(/*ripple*/ ctx[8].call(null, button)),
    					listen_dev(button, "click", /*click_handler_2*/ ctx[41], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[35], false, false, false),
    					listen_dev(button, "mouseover", /*mouseover_handler*/ ctx[36], false, false, false),
    					listen_dev(button, "*", /*_handler*/ ctx[37], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*icon*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*icon*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(button, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[43],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[43])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[43], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				(!current || dirty[0] & /*classes*/ 2) && { class: /*classes*/ ctx[1] },
    				/*props*/ ctx[9],
    				(!current || dirty[0] & /*type*/ 64) && { type: /*type*/ ctx[6] },
    				(!current || dirty[0] & /*disabled*/ 4) && { disabled: /*disabled*/ ctx[2] }
    			]));

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty[0] & /*href*/ 32) && { href: /*href*/ ctx[5] },
    				/*props*/ ctx[9]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(131:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (165:4) {#if icon}
    function create_if_block_2(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: /*iClasses*/ ctx[7],
    				small: /*small*/ ctx[4],
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iClasses*/ 128) icon_1_changes.class = /*iClasses*/ ctx[7];
    			if (dirty[0] & /*small*/ 16) icon_1_changes.small = /*small*/ ctx[4];

    			if (dirty[0] & /*icon*/ 8 | dirty[1] & /*$$scope*/ 4096) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(165:4) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (166:6) <Icon class={iClasses} {small}>
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 8) set_data_dev(t, /*icon*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(166:6) <Icon class={iClasses} {small}>",
    		ctx
    	});

    	return block_1;
    }

    // (147:6) {#if icon}
    function create_if_block_1(ctx) {
    	let icon_1;
    	let current;

    	icon_1 = new Icon({
    			props: {
    				class: /*iClasses*/ ctx[7],
    				small: /*small*/ ctx[4],
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block_1 = {
    		c: function create() {
    			create_component(icon_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(icon_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const icon_1_changes = {};
    			if (dirty[0] & /*iClasses*/ 128) icon_1_changes.class = /*iClasses*/ ctx[7];
    			if (dirty[0] & /*small*/ 16) icon_1_changes.small = /*small*/ ctx[4];

    			if (dirty[0] & /*icon*/ 8 | dirty[1] & /*$$scope*/ 4096) {
    				icon_1_changes.$$scope = { dirty, ctx };
    			}

    			icon_1.$set(icon_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(icon_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(147:6) {#if icon}",
    		ctx
    	});

    	return block_1;
    }

    // (148:8) <Icon class={iClasses} {small}>
    function create_default_slot$3(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*icon*/ ctx[3]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*icon*/ 8) set_data_dev(t, /*icon*/ ctx[3]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(148:8) <Icon class={iClasses} {small}>",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[5]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    const classesDefault$1 = 'z-10 py-2 px-4 uppercase text-sm font-medium relative overflow-hidden';
    const basicDefault = 'text-white duration-200 ease-in';
    const outlinedDefault = 'bg-transparent border border-solid';
    const textDefault = 'bg-transparent border-none px-4 hover:bg-transparent';
    const iconDefault = 'p-4 flex items-center select-none';
    const fabDefault = 'hover:bg-transparent';
    const smallDefault = 'pt-1 pb-1 pl-2 pr-2 text-xs';
    const disabledDefault = 'bg-gray-300 text-gray-500 dark:bg-dark-400 pointer-events-none hover:bg-gray-300 cursor-default';
    const elevationDefault = 'hover:shadow shadow';

    function instance$7($$self, $$props, $$invalidate) {
    	let normal;
    	let lighter;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, ['default']);
    	let { value = false } = $$props;
    	let { outlined = false } = $$props;
    	let { text = false } = $$props;
    	let { block = false } = $$props;
    	let { disabled = false } = $$props;
    	let { icon = null } = $$props;
    	let { small = false } = $$props;
    	let { light = false } = $$props;
    	let { dark = false } = $$props;
    	let { flat = false } = $$props;
    	let { iconClass = "" } = $$props;
    	let { color = "primary" } = $$props;
    	let { href = null } = $$props;
    	let { fab = false } = $$props;
    	let { type = "button" } = $$props;
    	let { remove = "" } = $$props;
    	let { add = "" } = $$props;
    	let { replace = {} } = $$props;
    	let { classes = classesDefault$1 } = $$props;
    	let { basicClasses = basicDefault } = $$props;
    	let { outlinedClasses = outlinedDefault } = $$props;
    	let { textClasses = textDefault } = $$props;
    	let { iconClasses = iconDefault } = $$props;
    	let { fabClasses = fabDefault } = $$props;
    	let { smallClasses = smallDefault } = $$props;
    	let { disabledClasses = disabledDefault } = $$props;
    	let { elevationClasses = elevationDefault } = $$props;
    	fab = fab || text && icon;
    	const basic = !outlined && !text && !fab;
    	const elevation = (basic || icon) && !disabled && !flat && !text;
    	let Classes = i => i;
    	let iClasses = i => i;
    	let shade = 0;
    	const { bg, border, txt } = utils(color);
    	const cb = new ClassBuilder(classes, classesDefault$1);
    	let iconCb;

    	if (icon) {
    		iconCb = new ClassBuilder(iconClass);
    	}

    	const ripple = r(text || fab || outlined ? color : "white");

    	const props = filterProps(
    		[
    			'outlined',
    			'text',
    			'color',
    			'block',
    			'disabled',
    			'icon',
    			'small',
    			'light',
    			'dark',
    			'flat',
    			'add',
    			'remove',
    			'replace'
    		],
    		$$props
    	);

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function _handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function click_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function mouseover_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	function _handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	const click_handler_2 = () => $$invalidate(0, value = !value);
    	const click_handler_3 = () => $$invalidate(0, value = !value);

    	$$self.$$set = $$new_props => {
    		$$invalidate(51, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('outlined' in $$new_props) $$invalidate(11, outlined = $$new_props.outlined);
    		if ('text' in $$new_props) $$invalidate(12, text = $$new_props.text);
    		if ('block' in $$new_props) $$invalidate(13, block = $$new_props.block);
    		if ('disabled' in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('icon' in $$new_props) $$invalidate(3, icon = $$new_props.icon);
    		if ('small' in $$new_props) $$invalidate(4, small = $$new_props.small);
    		if ('light' in $$new_props) $$invalidate(14, light = $$new_props.light);
    		if ('dark' in $$new_props) $$invalidate(15, dark = $$new_props.dark);
    		if ('flat' in $$new_props) $$invalidate(16, flat = $$new_props.flat);
    		if ('iconClass' in $$new_props) $$invalidate(17, iconClass = $$new_props.iconClass);
    		if ('color' in $$new_props) $$invalidate(18, color = $$new_props.color);
    		if ('href' in $$new_props) $$invalidate(5, href = $$new_props.href);
    		if ('fab' in $$new_props) $$invalidate(10, fab = $$new_props.fab);
    		if ('type' in $$new_props) $$invalidate(6, type = $$new_props.type);
    		if ('remove' in $$new_props) $$invalidate(19, remove = $$new_props.remove);
    		if ('add' in $$new_props) $$invalidate(20, add = $$new_props.add);
    		if ('replace' in $$new_props) $$invalidate(21, replace = $$new_props.replace);
    		if ('classes' in $$new_props) $$invalidate(1, classes = $$new_props.classes);
    		if ('basicClasses' in $$new_props) $$invalidate(22, basicClasses = $$new_props.basicClasses);
    		if ('outlinedClasses' in $$new_props) $$invalidate(23, outlinedClasses = $$new_props.outlinedClasses);
    		if ('textClasses' in $$new_props) $$invalidate(24, textClasses = $$new_props.textClasses);
    		if ('iconClasses' in $$new_props) $$invalidate(25, iconClasses = $$new_props.iconClasses);
    		if ('fabClasses' in $$new_props) $$invalidate(26, fabClasses = $$new_props.fabClasses);
    		if ('smallClasses' in $$new_props) $$invalidate(27, smallClasses = $$new_props.smallClasses);
    		if ('disabledClasses' in $$new_props) $$invalidate(28, disabledClasses = $$new_props.disabledClasses);
    		if ('elevationClasses' in $$new_props) $$invalidate(29, elevationClasses = $$new_props.elevationClasses);
    		if ('$$scope' in $$new_props) $$invalidate(43, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Icon,
    		utils,
    		ClassBuilder,
    		filterProps,
    		createRipple: r,
    		value,
    		outlined,
    		text,
    		block,
    		disabled,
    		icon,
    		small,
    		light,
    		dark,
    		flat,
    		iconClass,
    		color,
    		href,
    		fab,
    		type,
    		remove,
    		add,
    		replace,
    		classesDefault: classesDefault$1,
    		basicDefault,
    		outlinedDefault,
    		textDefault,
    		iconDefault,
    		fabDefault,
    		smallDefault,
    		disabledDefault,
    		elevationDefault,
    		classes,
    		basicClasses,
    		outlinedClasses,
    		textClasses,
    		iconClasses,
    		fabClasses,
    		smallClasses,
    		disabledClasses,
    		elevationClasses,
    		basic,
    		elevation,
    		Classes,
    		iClasses,
    		shade,
    		bg,
    		border,
    		txt,
    		cb,
    		iconCb,
    		ripple,
    		props,
    		lighter,
    		normal
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(51, $$props = assign(assign({}, $$props), $$new_props));
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('outlined' in $$props) $$invalidate(11, outlined = $$new_props.outlined);
    		if ('text' in $$props) $$invalidate(12, text = $$new_props.text);
    		if ('block' in $$props) $$invalidate(13, block = $$new_props.block);
    		if ('disabled' in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ('icon' in $$props) $$invalidate(3, icon = $$new_props.icon);
    		if ('small' in $$props) $$invalidate(4, small = $$new_props.small);
    		if ('light' in $$props) $$invalidate(14, light = $$new_props.light);
    		if ('dark' in $$props) $$invalidate(15, dark = $$new_props.dark);
    		if ('flat' in $$props) $$invalidate(16, flat = $$new_props.flat);
    		if ('iconClass' in $$props) $$invalidate(17, iconClass = $$new_props.iconClass);
    		if ('color' in $$props) $$invalidate(18, color = $$new_props.color);
    		if ('href' in $$props) $$invalidate(5, href = $$new_props.href);
    		if ('fab' in $$props) $$invalidate(10, fab = $$new_props.fab);
    		if ('type' in $$props) $$invalidate(6, type = $$new_props.type);
    		if ('remove' in $$props) $$invalidate(19, remove = $$new_props.remove);
    		if ('add' in $$props) $$invalidate(20, add = $$new_props.add);
    		if ('replace' in $$props) $$invalidate(21, replace = $$new_props.replace);
    		if ('classes' in $$props) $$invalidate(1, classes = $$new_props.classes);
    		if ('basicClasses' in $$props) $$invalidate(22, basicClasses = $$new_props.basicClasses);
    		if ('outlinedClasses' in $$props) $$invalidate(23, outlinedClasses = $$new_props.outlinedClasses);
    		if ('textClasses' in $$props) $$invalidate(24, textClasses = $$new_props.textClasses);
    		if ('iconClasses' in $$props) $$invalidate(25, iconClasses = $$new_props.iconClasses);
    		if ('fabClasses' in $$props) $$invalidate(26, fabClasses = $$new_props.fabClasses);
    		if ('smallClasses' in $$props) $$invalidate(27, smallClasses = $$new_props.smallClasses);
    		if ('disabledClasses' in $$props) $$invalidate(28, disabledClasses = $$new_props.disabledClasses);
    		if ('elevationClasses' in $$props) $$invalidate(29, elevationClasses = $$new_props.elevationClasses);
    		if ('Classes' in $$props) Classes = $$new_props.Classes;
    		if ('iClasses' in $$props) $$invalidate(7, iClasses = $$new_props.iClasses);
    		if ('shade' in $$props) $$invalidate(30, shade = $$new_props.shade);
    		if ('iconCb' in $$props) $$invalidate(31, iconCb = $$new_props.iconCb);
    		if ('lighter' in $$props) $$invalidate(32, lighter = $$new_props.lighter);
    		if ('normal' in $$props) $$invalidate(33, normal = $$new_props.normal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*light, dark, shade*/ 1073790976) {
    			{
    				$$invalidate(30, shade = light ? 200 : 0);
    				$$invalidate(30, shade = dark ? -400 : shade);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*shade*/ 1073741824) {
    			$$invalidate(33, normal = 500 - shade);
    		}

    		if ($$self.$$.dirty[0] & /*shade*/ 1073741824) {
    			$$invalidate(32, lighter = 400 - shade);
    		}

    		$$invalidate(1, classes = cb.flush().add(basicClasses, basic, basicDefault).add(`${bg(normal)} hover:${bg(lighter)}`, basic).add(elevationClasses, elevation, elevationDefault).add(outlinedClasses, outlined, outlinedDefault).add(`${border(lighter)} ${txt(normal)} hover:${bg("trans")} dark-hover:${bg("transDark")}`, outlined).add(`${txt(lighter)}`, text).add(textClasses, text, textDefault).add(iconClasses, icon, iconDefault).remove("py-2", icon).remove(txt(lighter), fab).add(disabledClasses, disabled, disabledDefault).add(smallClasses, small, smallDefault).add("flex items-center justify-center h-8 w-8", small && icon).add("border-solid", outlined).add("rounded-full", icon).add("w-full", block).add("rounded", basic || outlined || text).add("button", !icon).add(fabClasses, fab, fabDefault).add(`hover:${bg("transLight")}`, fab).add($$props.class).remove(remove).replace(replace).add(add).get());

    		if ($$self.$$.dirty[0] & /*fab, iconClass*/ 132096 | $$self.$$.dirty[1] & /*iconCb*/ 1) {
    			if (iconCb) {
    				$$invalidate(7, iClasses = iconCb.flush().add(txt(), fab && !iconClass).get());
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		classes,
    		disabled,
    		icon,
    		small,
    		href,
    		type,
    		iClasses,
    		ripple,
    		props,
    		fab,
    		outlined,
    		text,
    		block,
    		light,
    		dark,
    		flat,
    		iconClass,
    		color,
    		remove,
    		add,
    		replace,
    		basicClasses,
    		outlinedClasses,
    		textClasses,
    		iconClasses,
    		fabClasses,
    		smallClasses,
    		disabledClasses,
    		elevationClasses,
    		shade,
    		iconCb,
    		lighter,
    		normal,
    		slots,
    		click_handler,
    		mouseover_handler,
    		_handler,
    		click_handler_1,
    		mouseover_handler_1,
    		_handler_1,
    		click_handler_2,
    		click_handler_3,
    		$$scope
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$7,
    			create_fragment$7,
    			safe_not_equal,
    			{
    				value: 0,
    				outlined: 11,
    				text: 12,
    				block: 13,
    				disabled: 2,
    				icon: 3,
    				small: 4,
    				light: 14,
    				dark: 15,
    				flat: 16,
    				iconClass: 17,
    				color: 18,
    				href: 5,
    				fab: 10,
    				type: 6,
    				remove: 19,
    				add: 20,
    				replace: 21,
    				classes: 1,
    				basicClasses: 22,
    				outlinedClasses: 23,
    				textClasses: 24,
    				iconClasses: 25,
    				fabClasses: 26,
    				smallClasses: 27,
    				disabledClasses: 28,
    				elevationClasses: 29
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlined() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlined(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get light() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set light(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dark() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dark(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flat() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flat(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClass() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClass(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fab() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fab(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get add() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set add(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get basicClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basicClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outlinedClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outlinedClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iconClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iconClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fabClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fabClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get smallClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set smallClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabledClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabledClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elevationClasses() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elevationClasses(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quadIn(t) {
        return t * t;
    }
    function quadOut(t) {
        return -t * (t - 2.0);
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    /* node_modules/smelte/src/components/Util/Scrim.svelte generated by Svelte v3.46.2 */
    const file$5 = "node_modules/smelte/src/components/Util/Scrim.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "bg-black fixed top-0 left-0 z-10 w-full h-full");
    			set_style(div, "opacity", /*opacity*/ ctx[0]);
    			add_location(div, file$5, 9, 0, 262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (!current || dirty & /*opacity*/ 1) {
    				set_style(div, "opacity", /*opacity*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fade, /*inProps*/ ctx[1]);
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, /*outProps*/ ctx[2]);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
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

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scrim', slots, []);
    	let { opacity = 0.5 } = $$props;
    	let { inProps = { duration: 200, easing: quadIn } } = $$props;
    	let { outProps = { duration: 200, easing: quadOut } } = $$props;
    	const writable_props = ['opacity', 'inProps', 'outProps'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scrim> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('opacity' in $$props) $$invalidate(0, opacity = $$props.opacity);
    		if ('inProps' in $$props) $$invalidate(1, inProps = $$props.inProps);
    		if ('outProps' in $$props) $$invalidate(2, outProps = $$props.outProps);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		quadOut,
    		quadIn,
    		opacity,
    		inProps,
    		outProps
    	});

    	$$self.$inject_state = $$props => {
    		if ('opacity' in $$props) $$invalidate(0, opacity = $$props.opacity);
    		if ('inProps' in $$props) $$invalidate(1, inProps = $$props.inProps);
    		if ('outProps' in $$props) $$invalidate(2, outProps = $$props.outProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [opacity, inProps, outProps, click_handler];
    }

    class Scrim$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { opacity: 0, inProps: 1, outProps: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scrim",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get opacity() {
    		throw new Error("<Scrim>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Scrim>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inProps() {
    		throw new Error("<Scrim>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inProps(value) {
    		throw new Error("<Scrim>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outProps() {
    		throw new Error("<Scrim>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outProps(value) {
    		throw new Error("<Scrim>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const Scrim = Scrim$1;

    /* node_modules/smelte/src/components/Dialog/Dialog.svelte generated by Svelte v3.46.2 */
    const file$4 = "node_modules/smelte/src/components/Dialog/Dialog.svelte";
    const get_actions_slot_changes$1 = dirty => ({});
    const get_actions_slot_context$1 = ctx => ({});
    const get_title_slot_changes$1 = dirty => ({});
    const get_title_slot_context$1 = ctx => ({});

    // (45:0) {#if value}
    function create_if_block(ctx) {
    	let div4;
    	let scrim;
    	let t0;
    	let div3;
    	let div2;
    	let div0;
    	let t1;
    	let t2;
    	let div1;
    	let div2_intro;
    	let current;

    	scrim = new Scrim({
    			props: { opacity: /*opacity*/ ctx[1] },
    			$$inline: true
    		});

    	scrim.$on("click", /*click_handler*/ ctx[12]);
    	const title_slot_template = /*#slots*/ ctx[11].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[10], get_title_slot_context$1);
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	const actions_slot_template = /*#slots*/ ctx[11].actions;
    	const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[10], get_actions_slot_context$1);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			create_component(scrim.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			if (title_slot) title_slot.c();
    			t1 = space();
    			if (default_slot) default_slot.c();
    			t2 = space();
    			div1 = element("div");
    			if (actions_slot) actions_slot.c();
    			attr_dev(div0, "class", /*t*/ ctx[5]);
    			add_location(div0, file$4, 51, 8, 1518);
    			attr_dev(div1, "class", /*a*/ ctx[4]);
    			add_location(div1, file$4, 55, 8, 1606);
    			attr_dev(div2, "class", /*c*/ ctx[6]);
    			add_location(div2, file$4, 48, 6, 1451);
    			attr_dev(div3, "class", "h-full w-full absolute flex items-center justify-center");
    			add_location(div3, file$4, 47, 4, 1375);
    			attr_dev(div4, "class", "fixed w-full h-full top-0 left-0 z-30");
    			add_location(div4, file$4, 45, 2, 1247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			mount_component(scrim, div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);

    			if (title_slot) {
    				title_slot.m(div0, null);
    			}

    			append_dev(div2, t1);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			if (actions_slot) {
    				actions_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const scrim_changes = {};
    			if (dirty & /*opacity*/ 2) scrim_changes.opacity = /*opacity*/ ctx[1];
    			scrim.$set(scrim_changes);

    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[10], dirty, get_title_slot_changes$1),
    						get_title_slot_context$1
    					);
    				}
    			}

    			if (!current || dirty & /*t*/ 32) {
    				attr_dev(div0, "class", /*t*/ ctx[5]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (actions_slot) {
    				if (actions_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						actions_slot,
    						actions_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(actions_slot_template, /*$$scope*/ ctx[10], dirty, get_actions_slot_changes$1),
    						get_actions_slot_context$1
    					);
    				}
    			}

    			if (!current || dirty & /*a*/ 16) {
    				attr_dev(div1, "class", /*a*/ ctx[4]);
    			}

    			if (!current || dirty & /*c*/ 64) {
    				attr_dev(div2, "class", /*c*/ ctx[6]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scrim.$$.fragment, local);
    			transition_in(title_slot, local);
    			transition_in(default_slot, local);
    			transition_in(actions_slot, local);

    			if (!div2_intro) {
    				add_render_callback(() => {
    					div2_intro = create_in_transition(div2, scale, /*transitionProps*/ ctx[3]);
    					div2_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scrim.$$.fragment, local);
    			transition_out(title_slot, local);
    			transition_out(default_slot, local);
    			transition_out(actions_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(scrim);
    			if (title_slot) title_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			if (actions_slot) actions_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(45:0) {#if value}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*value*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*value*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*value*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    const classesDefault = "items-center z-50 rounded bg-white dark:bg-dark-400 p-4 shadow";
    const titleClassesDefault = "text-lg font-bold pb-4";
    const actionsClassesDefault = "flex w-full justify-end pt-4";

    function instance$5($$self, $$props, $$invalidate) {
    	let c;
    	let t;
    	let a;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dialog', slots, ['title','default','actions']);
    	let { value } = $$props;
    	let { classes = classesDefault } = $$props;
    	let { titleClasses = titleClassesDefault } = $$props;
    	let { actionsClasses = actionsClassesDefault } = $$props;
    	let { opacity = 0.5 } = $$props;
    	let { persistent = false } = $$props;

    	let { transitionProps = {
    		duration: 150,
    		easing: quadIn,
    		delay: 150
    	} } = $$props;

    	const cb = new ClassBuilder(classes, classesDefault);
    	const tcb = new ClassBuilder(titleClasses, titleClassesDefault);
    	const acb = new ClassBuilder(actionsClasses, actionsClassesDefault);
    	const click_handler = () => !persistent && $$invalidate(0, value = false);

    	$$self.$$set = $$new_props => {
    		$$invalidate(16, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('classes' in $$new_props) $$invalidate(7, classes = $$new_props.classes);
    		if ('titleClasses' in $$new_props) $$invalidate(8, titleClasses = $$new_props.titleClasses);
    		if ('actionsClasses' in $$new_props) $$invalidate(9, actionsClasses = $$new_props.actionsClasses);
    		if ('opacity' in $$new_props) $$invalidate(1, opacity = $$new_props.opacity);
    		if ('persistent' in $$new_props) $$invalidate(2, persistent = $$new_props.persistent);
    		if ('transitionProps' in $$new_props) $$invalidate(3, transitionProps = $$new_props.transitionProps);
    		if ('$$scope' in $$new_props) $$invalidate(10, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		scale,
    		onMount,
    		quadIn,
    		Scrim,
    		ClassBuilder,
    		classesDefault,
    		titleClassesDefault,
    		actionsClassesDefault,
    		value,
    		classes,
    		titleClasses,
    		actionsClasses,
    		opacity,
    		persistent,
    		transitionProps,
    		cb,
    		tcb,
    		acb,
    		a,
    		t,
    		c
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(16, $$props = assign(assign({}, $$props), $$new_props));
    		if ('value' in $$props) $$invalidate(0, value = $$new_props.value);
    		if ('classes' in $$props) $$invalidate(7, classes = $$new_props.classes);
    		if ('titleClasses' in $$props) $$invalidate(8, titleClasses = $$new_props.titleClasses);
    		if ('actionsClasses' in $$props) $$invalidate(9, actionsClasses = $$new_props.actionsClasses);
    		if ('opacity' in $$props) $$invalidate(1, opacity = $$new_props.opacity);
    		if ('persistent' in $$props) $$invalidate(2, persistent = $$new_props.persistent);
    		if ('transitionProps' in $$props) $$invalidate(3, transitionProps = $$new_props.transitionProps);
    		if ('a' in $$props) $$invalidate(4, a = $$new_props.a);
    		if ('t' in $$props) $$invalidate(5, t = $$new_props.t);
    		if ('c' in $$props) $$invalidate(6, c = $$new_props.c);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		$$invalidate(6, c = cb.flush().add(classes, true, classesDefault).add($$props.class).get());

    		if ($$self.$$.dirty & /*titleClasses*/ 256) {
    			$$invalidate(5, t = tcb.flush().add(titleClasses, true, actionsClassesDefault).get());
    		}

    		if ($$self.$$.dirty & /*actionsClasses*/ 512) {
    			$$invalidate(4, a = acb.flush().add(actionsClasses, true, actionsClassesDefault).get());
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		opacity,
    		persistent,
    		transitionProps,
    		a,
    		t,
    		c,
    		classes,
    		titleClasses,
    		actionsClasses,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			value: 0,
    			classes: 7,
    			titleClasses: 8,
    			actionsClasses: 9,
    			opacity: 1,
    			persistent: 2,
    			transitionProps: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !('value' in props)) {
    			console.warn("<Dialog> was created without expected prop 'value'");
    		}
    	}

    	get value() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get titleClasses() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set titleClasses(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actionsClasses() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actionsClasses(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get opacity() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set opacity(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get persistent() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set persistent(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionProps() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionProps(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/common/FancyDialog.svelte generated by Svelte v3.46.2 */
    const file$3 = "src/common/FancyDialog.svelte";
    const get_title_slot_changes = dirty => ({});
    const get_title_slot_context = ctx => ({ slot: "title" });
    const get_actions_slot_changes = dirty => ({});
    const get_actions_slot_context = ctx => ({ slot: "actions" });

    // (6:0) <Dialog bind:value={showDialog} classes={(c) => c + " m-2"}>
    function create_default_slot$2(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "dialog-content" + (/*small*/ ctx[1] ? ' small' : '') + " svelte-325t5y");
    			add_location(div, file$3, 8, 1, 236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*small*/ 2 && div_class_value !== (div_class_value = "dialog-content" + (/*small*/ ctx[1] ? ' small' : '') + " svelte-325t5y")) {
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
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(6:0) <Dialog bind:value={showDialog} classes={(c) => c + \\\" m-2\\\"}>",
    		ctx
    	});

    	return block;
    }

    // (7:1) 
    function create_title_slot$2(ctx) {
    	let current;
    	const title_slot_template = /*#slots*/ ctx[2].title;
    	const title_slot = create_slot(title_slot_template, ctx, /*$$scope*/ ctx[4], get_title_slot_context);

    	const block = {
    		c: function create() {
    			if (title_slot) title_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (title_slot) {
    				title_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (title_slot) {
    				if (title_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						title_slot,
    						title_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(title_slot_template, /*$$scope*/ ctx[4], dirty, get_title_slot_changes),
    						get_title_slot_context
    					);
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
    			if (title_slot) title_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$2.name,
    		type: "slot",
    		source: "(7:1) ",
    		ctx
    	});

    	return block;
    }

    // (13:1) 
    function create_actions_slot$2(ctx) {
    	let current;
    	const actions_slot_template = /*#slots*/ ctx[2].actions;
    	const actions_slot = create_slot(actions_slot_template, ctx, /*$$scope*/ ctx[4], get_actions_slot_context);

    	const block = {
    		c: function create() {
    			if (actions_slot) actions_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (actions_slot) {
    				actions_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (actions_slot) {
    				if (actions_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						actions_slot,
    						actions_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(actions_slot_template, /*$$scope*/ ctx[4], dirty, get_actions_slot_changes),
    						get_actions_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(actions_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(actions_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (actions_slot) actions_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot$2.name,
    		type: "slot",
    		source: "(13:1) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let dialog;
    	let updating_value;
    	let current;

    	function dialog_value_binding(value) {
    		/*dialog_value_binding*/ ctx[3](value);
    	}

    	let dialog_props = {
    		classes: func,
    		$$slots: {
    			actions: [create_actions_slot$2],
    			title: [create_title_slot$2],
    			default: [create_default_slot$2]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showDialog*/ ctx[0] !== void 0) {
    		dialog_props.value = /*showDialog*/ ctx[0];
    	}

    	dialog = new Dialog({ props: dialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(dialog, 'value', dialog_value_binding));

    	const block = {
    		c: function create() {
    			create_component(dialog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(dialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const dialog_changes = {};

    			if (dirty & /*$$scope, small*/ 18) {
    				dialog_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_value && dirty & /*showDialog*/ 1) {
    				updating_value = true;
    				dialog_changes.value = /*showDialog*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dialog, detaching);
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

    const func = c => c + " m-2";

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FancyDialog', slots, ['actions','title','default']);
    	let { showDialog = false } = $$props;
    	let { small = false } = $$props;
    	const writable_props = ['showDialog', 'small'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FancyDialog> was created with unknown prop '${key}'`);
    	});

    	function dialog_value_binding(value) {
    		showDialog = value;
    		$$invalidate(0, showDialog);
    	}

    	$$self.$$set = $$props => {
    		if ('showDialog' in $$props) $$invalidate(0, showDialog = $$props.showDialog);
    		if ('small' in $$props) $$invalidate(1, small = $$props.small);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Dialog, showDialog, small });

    	$$self.$inject_state = $$props => {
    		if ('showDialog' in $$props) $$invalidate(0, showDialog = $$props.showDialog);
    		if ('small' in $$props) $$invalidate(1, small = $$props.small);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showDialog, small, slots, dialog_value_binding, $$scope];
    }

    class FancyDialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { showDialog: 0, small: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FancyDialog",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get showDialog() {
    		throw new Error("<FancyDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showDialog(value) {
    		throw new Error("<FancyDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get small() {
    		throw new Error("<FancyDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set small(value) {
    		throw new Error("<FancyDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/InfoDialog.svelte generated by Svelte v3.46.2 */
    const file$2 = "src/components/InfoDialog.svelte";

    // (6:0) <FancyDialog small bind:showDialog>
    function create_default_slot_1$1(ctx) {
    	let p;
    	let t0;
    	let a;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("This is a simple clone of ");
    			a = element("a");
    			a.textContent = "2048";
    			t2 = text(" that I used to test out Svelte. The only real difference with the original\n\t\tis that this one will let you grow or shrink the board if you'd like. Careful,\n\t\tthough - growing the board keeps your score and tiles intact, while shrinking\n\t\tthe board resets them. Have fun!");
    			attr_dev(a, "href", "https://en.wikipedia.org/wiki/2048_(video_game)");
    			add_location(a, file$2, 9, 28, 268);
    			add_location(p, file$2, 8, 1, 236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, a);
    			append_dev(p, t2);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(6:0) <FancyDialog small bind:showDialog>",
    		ctx
    	});

    	return block;
    }

    // (7:1) 
    function create_title_slot$1(ctx) {
    	let h5;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Welcome!";
    			attr_dev(h5, "slot", "title");
    			add_location(h5, file$2, 6, 1, 203);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot$1.name,
    		type: "slot",
    		source: "(7:1) ",
    		ctx
    	});

    	return block;
    }

    // (19:2) <Button text on:click={() => (showDialog = false)}>
    function create_default_slot$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Thanks!");
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
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(19:2) <Button text on:click={() => (showDialog = false)}>",
    		ctx
    	});

    	return block;
    }

    // (18:1) 
    function create_actions_slot$1(ctx) {
    	let div;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button.$on("click", /*click_handler*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button.$$.fragment);
    			attr_dev(div, "slot", "actions");
    			add_location(div, file$2, 17, 1, 620);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot$1.name,
    		type: "slot",
    		source: "(18:1) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let fancydialog;
    	let updating_showDialog;
    	let current;

    	function fancydialog_showDialog_binding(value) {
    		/*fancydialog_showDialog_binding*/ ctx[2](value);
    	}

    	let fancydialog_props = {
    		small: true,
    		$$slots: {
    			actions: [create_actions_slot$1],
    			title: [create_title_slot$1],
    			default: [create_default_slot_1$1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showDialog*/ ctx[0] !== void 0) {
    		fancydialog_props.showDialog = /*showDialog*/ ctx[0];
    	}

    	fancydialog = new FancyDialog({ props: fancydialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(fancydialog, 'showDialog', fancydialog_showDialog_binding));

    	const block = {
    		c: function create() {
    			create_component(fancydialog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(fancydialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const fancydialog_changes = {};

    			if (dirty & /*$$scope, showDialog*/ 9) {
    				fancydialog_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_showDialog && dirty & /*showDialog*/ 1) {
    				updating_showDialog = true;
    				fancydialog_changes.showDialog = /*showDialog*/ ctx[0];
    				add_flush_callback(() => updating_showDialog = false);
    			}

    			fancydialog.$set(fancydialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fancydialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fancydialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fancydialog, detaching);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('InfoDialog', slots, []);
    	let { showDialog = true } = $$props;
    	const writable_props = ['showDialog'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<InfoDialog> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showDialog = false);

    	function fancydialog_showDialog_binding(value) {
    		showDialog = value;
    		$$invalidate(0, showDialog);
    	}

    	$$self.$$set = $$props => {
    		if ('showDialog' in $$props) $$invalidate(0, showDialog = $$props.showDialog);
    	};

    	$$self.$capture_state = () => ({ Button, FancyDialog, showDialog });

    	$$self.$inject_state = $$props => {
    		if ('showDialog' in $$props) $$invalidate(0, showDialog = $$props.showDialog);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showDialog, click_handler, fancydialog_showDialog_binding];
    }

    class InfoDialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { showDialog: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InfoDialog",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get showDialog() {
    		throw new Error("<InfoDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showDialog(value) {
    		throw new Error("<InfoDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/GameOverDialog.svelte generated by Svelte v3.46.2 */
    const file$1 = "src/components/GameOverDialog.svelte";

    // (7:0) <FancyDialog small bind:showDialog>
    function create_default_slot_2(ctx) {
    	let p;
    	let t0;
    	let b;
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("The game might be over but the fun doesn't have to be. Your final score\n\t\twas ");
    			b = element("b");
    			t1 = text(/*score*/ ctx[1]);
    			t2 = text(". Will you play again?");
    			add_location(b, file$1, 11, 6, 339);
    			add_location(p, file$1, 9, 1, 255);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, b);
    			append_dev(b, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*score*/ 2) set_data_dev(t1, /*score*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(7:0) <FancyDialog small bind:showDialog>",
    		ctx
    	});

    	return block;
    }

    // (8:1) 
    function create_title_slot(ctx) {
    	let h5;

    	const block = {
    		c: function create() {
    			h5 = element("h5");
    			h5.textContent = "Game Over";
    			attr_dev(h5, "slot", "title");
    			add_location(h5, file$1, 7, 1, 221);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h5, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_title_slot.name,
    		type: "slot",
    		source: "(8:1) ",
    		ctx
    	});

    	return block;
    }

    // (16:2) <Button text on:click={() => (showDialog = false)}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Yes!");
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
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(16:2) <Button text on:click={() => (showDialog = false)}>",
    		ctx
    	});

    	return block;
    }

    // (17:2) <Button text on:click={() => (showDialog = false)}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Absolutely!");
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
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(17:2) <Button text on:click={() => (showDialog = false)}>",
    		ctx
    	});

    	return block;
    }

    // (15:1) 
    function create_actions_slot(ctx) {
    	let div;
    	let button0;
    	let t;
    	let button1;
    	let current;

    	button0 = new Button({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[2]);

    	button1 = new Button({
    			props: {
    				text: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[3]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    			attr_dev(div, "slot", "actions");
    			add_location(div, file$1, 14, 1, 384);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(button0, div, null);
    			append_dev(div, t);
    			mount_component(button1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_actions_slot.name,
    		type: "slot",
    		source: "(15:1) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let fancydialog;
    	let updating_showDialog;
    	let current;

    	function fancydialog_showDialog_binding(value) {
    		/*fancydialog_showDialog_binding*/ ctx[4](value);
    	}

    	let fancydialog_props = {
    		small: true,
    		$$slots: {
    			actions: [create_actions_slot],
    			title: [create_title_slot],
    			default: [create_default_slot_2]
    		},
    		$$scope: { ctx }
    	};

    	if (/*showDialog*/ ctx[0] !== void 0) {
    		fancydialog_props.showDialog = /*showDialog*/ ctx[0];
    	}

    	fancydialog = new FancyDialog({ props: fancydialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(fancydialog, 'showDialog', fancydialog_showDialog_binding));

    	const block = {
    		c: function create() {
    			create_component(fancydialog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(fancydialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const fancydialog_changes = {};

    			if (dirty & /*$$scope, showDialog, score*/ 35) {
    				fancydialog_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_showDialog && dirty & /*showDialog*/ 1) {
    				updating_showDialog = true;
    				fancydialog_changes.showDialog = /*showDialog*/ ctx[0];
    				add_flush_callback(() => updating_showDialog = false);
    			}

    			fancydialog.$set(fancydialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fancydialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fancydialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fancydialog, detaching);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GameOverDialog', slots, []);
    	let { showDialog = true } = $$props;
    	let { score } = $$props;
    	const writable_props = ['showDialog', 'score'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GameOverDialog> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showDialog = false);
    	const click_handler_1 = () => $$invalidate(0, showDialog = false);

    	function fancydialog_showDialog_binding(value) {
    		showDialog = value;
    		$$invalidate(0, showDialog);
    	}

    	$$self.$$set = $$props => {
    		if ('showDialog' in $$props) $$invalidate(0, showDialog = $$props.showDialog);
    		if ('score' in $$props) $$invalidate(1, score = $$props.score);
    	};

    	$$self.$capture_state = () => ({ Button, FancyDialog, showDialog, score });

    	$$self.$inject_state = $$props => {
    		if ('showDialog' in $$props) $$invalidate(0, showDialog = $$props.showDialog);
    		if ('score' in $$props) $$invalidate(1, score = $$props.score);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showDialog,
    		score,
    		click_handler,
    		click_handler_1,
    		fancydialog_showDialog_binding
    	];
    }

    class GameOverDialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { showDialog: 0, score: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GameOverDialog",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*score*/ ctx[1] === undefined && !('score' in props)) {
    			console.warn("<GameOverDialog> was created without expected prop 'score'");
    		}
    	}

    	get showDialog() {
    		throw new Error("<GameOverDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showDialog(value) {
    		throw new Error("<GameOverDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get score() {
    		throw new Error("<GameOverDialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set score(value) {
    		throw new Error("<GameOverDialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Game.svelte generated by Svelte v3.46.2 */

    function create_fragment$1(ctx) {
    	let board;
    	let updating_cells;
    	let updating_numCols;
    	let updating_numRows;
    	let t0;
    	let infodialog;
    	let updating_showDialog;
    	let t1;
    	let gameoverdialog;
    	let updating_showDialog_1;
    	let current;
    	let mounted;
    	let dispose;

    	function board_cells_binding(value) {
    		/*board_cells_binding*/ ctx[22](value);
    	}

    	function board_numCols_binding(value) {
    		/*board_numCols_binding*/ ctx[23](value);
    	}

    	function board_numRows_binding(value) {
    		/*board_numRows_binding*/ ctx[24](value);
    	}

    	let board_props = {};

    	if (/*cells*/ ctx[1] !== void 0) {
    		board_props.cells = /*cells*/ ctx[1];
    	}

    	if (/*numCols*/ ctx[4] !== void 0) {
    		board_props.numCols = /*numCols*/ ctx[4];
    	}

    	if (/*numRows*/ ctx[5] !== void 0) {
    		board_props.numRows = /*numRows*/ ctx[5];
    	}

    	board = new Board({ props: board_props, $$inline: true });
    	binding_callbacks.push(() => bind(board, 'cells', board_cells_binding));
    	binding_callbacks.push(() => bind(board, 'numCols', board_numCols_binding));
    	binding_callbacks.push(() => bind(board, 'numRows', board_numRows_binding));
    	board.$on("up", /*up_handler*/ ctx[25]);
    	board.$on("down", /*down_handler*/ ctx[26]);
    	board.$on("left", /*left_handler*/ ctx[27]);
    	board.$on("right", /*right_handler*/ ctx[28]);
    	board.$on("restart", /*restart_handler*/ ctx[29]);
    	board.$on("shrink", /*shrink_handler*/ ctx[30]);
    	board.$on("grow", /*grow_handler*/ ctx[31]);
    	board.$on("showInfo", /*showInfo_handler*/ ctx[32]);

    	function infodialog_showDialog_binding(value) {
    		/*infodialog_showDialog_binding*/ ctx[33](value);
    	}

    	let infodialog_props = {};

    	if (/*showInfo*/ ctx[3] !== void 0) {
    		infodialog_props.showDialog = /*showInfo*/ ctx[3];
    	}

    	infodialog = new InfoDialog({ props: infodialog_props, $$inline: true });
    	binding_callbacks.push(() => bind(infodialog, 'showDialog', infodialog_showDialog_binding));

    	function gameoverdialog_showDialog_binding(value) {
    		/*gameoverdialog_showDialog_binding*/ ctx[34](value);
    	}

    	let gameoverdialog_props = { score: /*score*/ ctx[2] };

    	if (/*isGameOver*/ ctx[0] !== void 0) {
    		gameoverdialog_props.showDialog = /*isGameOver*/ ctx[0];
    	}

    	gameoverdialog = new GameOverDialog({
    			props: gameoverdialog_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(gameoverdialog, 'showDialog', gameoverdialog_showDialog_binding));

    	const block = {
    		c: function create() {
    			create_component(board.$$.fragment);
    			t0 = space();
    			create_component(infodialog.$$.fragment);
    			t1 = space();
    			create_component(gameoverdialog.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(board, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(infodialog, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(gameoverdialog, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keydown", /*handleKeydown*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const board_changes = {};

    			if (!updating_cells && dirty[0] & /*cells*/ 2) {
    				updating_cells = true;
    				board_changes.cells = /*cells*/ ctx[1];
    				add_flush_callback(() => updating_cells = false);
    			}

    			if (!updating_numCols && dirty[0] & /*numCols*/ 16) {
    				updating_numCols = true;
    				board_changes.numCols = /*numCols*/ ctx[4];
    				add_flush_callback(() => updating_numCols = false);
    			}

    			if (!updating_numRows && dirty[0] & /*numRows*/ 32) {
    				updating_numRows = true;
    				board_changes.numRows = /*numRows*/ ctx[5];
    				add_flush_callback(() => updating_numRows = false);
    			}

    			board.$set(board_changes);
    			const infodialog_changes = {};

    			if (!updating_showDialog && dirty[0] & /*showInfo*/ 8) {
    				updating_showDialog = true;
    				infodialog_changes.showDialog = /*showInfo*/ ctx[3];
    				add_flush_callback(() => updating_showDialog = false);
    			}

    			infodialog.$set(infodialog_changes);
    			const gameoverdialog_changes = {};
    			if (dirty[0] & /*score*/ 4) gameoverdialog_changes.score = /*score*/ ctx[2];

    			if (!updating_showDialog_1 && dirty[0] & /*isGameOver*/ 1) {
    				updating_showDialog_1 = true;
    				gameoverdialog_changes.showDialog = /*isGameOver*/ ctx[0];
    				add_flush_callback(() => updating_showDialog_1 = false);
    			}

    			gameoverdialog.$set(gameoverdialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(board.$$.fragment, local);
    			transition_in(infodialog.$$.fragment, local);
    			transition_in(gameoverdialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(board.$$.fragment, local);
    			transition_out(infodialog.$$.fragment, local);
    			transition_out(gameoverdialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(board, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(infodialog, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(gameoverdialog, detaching);
    			mounted = false;
    			dispose();
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

    function* forwardIterator(cells) {
    	for (let i = 0; i < cells.length; i++) {
    		yield i;
    	}
    }

    function* backwardIterator(cells) {
    	for (let i = cells.length - 1; i >= 0; i--) {
    		yield i;
    	}
    }

    function getCellAt(cells, index) {
    	let cell = cells[index];
    	return cell;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Game', slots, []);
    	let cells = [];
    	let score = 0;
    	let isGameOver = false;
    	let showInfo = false;
    	let numCols = 4;
    	let numRows = 4;

    	function shrink() {
    		if (numCols > 1 && numRows > 1) {
    			$$invalidate(4, numCols -= 1);
    			$$invalidate(5, numRows -= 1);
    			restart();
    		}
    	}

    	function grow() {
    		$$invalidate(4, numCols += 1);
    		$$invalidate(5, numRows += 1);

    		// maintain as much old state as possible
    		let oldCells = cells;

    		let newCells = generateCells(numRows * numCols, 0);
    		let oldNumCols = numCols - 1;
    		let oldNumRows = numRows - 1;
    		let oldCellIndex = -1;
    		let row = 0;
    		let col = -1;

    		for (let i = 0; i < newCells.length; i++) {
    			col += 1;

    			if (col >= numCols) {
    				col = 0;
    				row += 1;
    			}

    			if (row >= oldNumRows || col >= oldNumCols) {
    				continue;
    			}

    			oldCellIndex += 1;
    			newCells[i].value = oldCells[oldCellIndex].value;
    		}

    		$$invalidate(1, cells = newCells);
    	}

    	function restart() {
    		$$invalidate(1, cells = generateCells(numRows * numCols, 3));
    		$$invalidate(2, score = 0);
    		$$invalidate(0, isGameOver = false);
    	}

    	function handleKeydown(event) {
    		const key = event.key;
    		event.keyCode;

    		switch (key) {
    			case "r":
    				restart();
    				break;
    			case "ArrowUp":
    				clearAndMove(moveUp);
    				break;
    			case "ArrowDown":
    				clearAndMove(moveDown);
    				break;
    			case "ArrowLeft":
    				clearAndMove(moveLeft);
    				break;
    			case "ArrowRight":
    				clearAndMove(moveRight);
    				break;
    		}
    	}

    	function addRandomCell() {
    		let empties = [];

    		for (let cell of cells) {
    			if (cell.value === 0) {
    				empties.push(cell);
    			}

    			cell.shouldAppear = false;
    		}

    		if (empties.length === 0) {
    			$$invalidate(0, isGameOver = true);
    			return false;
    		} else {
    			let randomCell = getRandomElement(empties);
    			randomCell.value = getRandomStartingValue();
    			randomCell.shouldAppear = true;
    			return true;
    		}
    	}

    	function couldMove() {
    		// TODO: make less hacky
    		return moveUp(false) || moveDown(false) || moveRight(false) || moveLeft(false);
    	}

    	async function clearAndMove(callback) {
    		// NOTE: ideally we'd use `tick()` here, but sometimes animation events get lost,
    		// so we're stuck with this hacky setTimeout thing
    		clearStyles();

    		setTimeout(() => {
    			callback();
    		});
    	}

    	function clearStyles() {
    		for (let cell of cells) {
    			cell.wasMerged = false;
    			cell.shouldAppear = false;
    		}

    		$$invalidate(1, cells);
    	}

    	function moveUp(commit = true) {
    		return doMove(getPreviousRow, getNextRow, forwardIterator, commit);
    	}

    	function moveDown(commit = true) {
    		return doMove(getNextRow, getPreviousRow, backwardIterator, commit);
    	}

    	function moveLeft(commit = true) {
    		return doMove(getPreviousColumn, getNextColumn, forwardIterator, commit);
    	}

    	function moveRight(commit = true) {
    		return doMove(getNextColumn, getPreviousColumn, backwardIterator, commit);
    	}

    	function doMove(nextCellFunction, previousCellFunction, iterator, commit) {
    		let didMove = false;

    		// slide
    		didMove = doSlide(nextCellFunction, previousCellFunction, iterator, commit) || didMove;

    		if (didMove && !commit) {
    			return didMove;
    		}

    		// merge
    		let didMerge = false;

    		for (let i of iterator(cells)) {
    			let cell = cells[i];

    			// if (cell.value !== 0 && !cell.wasMerged) {
    			if (cell.value !== 0) {
    				let previousCell = previousCellFunction(cells, i);

    				if (previousCell && previousCell.value === cell.value) {
    					if (commit) {
    						didMerge = true;
    						didMove = true;
    						cell.wasMerged = true;
    						cell.value += previousCell.value;
    						previousCell.value = 0;
    						$$invalidate(2, score += cell.value);
    					} else {
    						return true;
    					}
    				}
    			}
    		}

    		// slide again, if necessary
    		if (didMerge) {
    			didMove = doSlide(nextCellFunction, previousCellFunction, iterator, commit) || didMove;
    		}

    		if (!commit) {
    			return didMove;
    		}

    		if (didMove) {
    			addRandomCell();
    			$$invalidate(1, cells);
    		} else if (!couldMove()) {
    			$$invalidate(0, isGameOver = true);
    		}

    		return didMove;
    	}

    	function doSlide(nextCellFunction, previousCellFunction, iterator, commit) {
    		let didMove = false;

    		while (true) {
    			let didSlide = false;

    			for (const i of iterator(cells)) {
    				let cell = cells[i];

    				if (cell.value !== 0) {
    					let nextCell = nextCellFunction(cells, i);

    					if (nextCell && nextCell.value === 0) {
    						if (commit) {
    							didSlide = true;
    							didMove = true;
    							nextCell.value = cell.value;
    							nextCell.wasMerged = cell.wasMerged;
    							cell.wasMerged = false;
    							cell.value = 0;
    						} else {
    							return true;
    						}
    					}
    				}
    			}

    			if (!didSlide) {
    				break;
    			}
    		}

    		return didMove;
    	}

    	function getNextRow(cells, index) {
    		return getCellAt(cells, index + numCols);
    	}

    	function getPreviousRow(cells, index) {
    		return getCellAt(cells, index - numRows);
    	}

    	function getNextColumn(cells, index) {
    		if ((index + 1) % numCols === 0) {
    			// far right
    			return null;
    		}

    		return getCellAt(cells, index + 1);
    	}

    	function getPreviousColumn(cells, index) {
    		if (index % numCols === 0) {
    			// far left
    			return null;
    		}

    		return getCellAt(cells, index - 1);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	function board_cells_binding(value) {
    		cells = value;
    		$$invalidate(1, cells);
    	}

    	function board_numCols_binding(value) {
    		numCols = value;
    		$$invalidate(4, numCols);
    	}

    	function board_numRows_binding(value) {
    		numRows = value;
    		$$invalidate(5, numRows);
    	}

    	const up_handler = () => clearAndMove(moveUp);
    	const down_handler = () => clearAndMove(moveDown);
    	const left_handler = () => clearAndMove(moveLeft);
    	const right_handler = () => clearAndMove(moveRight);
    	const restart_handler = () => restart();
    	const shrink_handler = () => shrink();
    	const grow_handler = () => grow();
    	const showInfo_handler = () => $$invalidate(3, showInfo = true);

    	function infodialog_showDialog_binding(value) {
    		showInfo = value;
    		$$invalidate(3, showInfo);
    	}

    	function gameoverdialog_showDialog_binding(value) {
    		isGameOver = value;
    		$$invalidate(0, isGameOver);
    	}

    	$$self.$capture_state = () => ({
    		getRandomElement,
    		generateCells,
    		getRandomStartingValue,
    		Board,
    		InfoDialog,
    		GameOverDialog,
    		cells,
    		score,
    		isGameOver,
    		showInfo,
    		numCols,
    		numRows,
    		shrink,
    		grow,
    		restart,
    		handleKeydown,
    		addRandomCell,
    		couldMove,
    		clearAndMove,
    		clearStyles,
    		moveUp,
    		moveDown,
    		moveLeft,
    		moveRight,
    		doMove,
    		doSlide,
    		forwardIterator,
    		backwardIterator,
    		getNextRow,
    		getPreviousRow,
    		getNextColumn,
    		getPreviousColumn,
    		getCellAt
    	});

    	$$self.$inject_state = $$props => {
    		if ('cells' in $$props) $$invalidate(1, cells = $$props.cells);
    		if ('score' in $$props) $$invalidate(2, score = $$props.score);
    		if ('isGameOver' in $$props) $$invalidate(0, isGameOver = $$props.isGameOver);
    		if ('showInfo' in $$props) $$invalidate(3, showInfo = $$props.showInfo);
    		if ('numCols' in $$props) $$invalidate(4, numCols = $$props.numCols);
    		if ('numRows' in $$props) $$invalidate(5, numRows = $$props.numRows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*isGameOver*/ 1) {
    			{
    				if (isGameOver === false) {
    					restart();
    				}
    			}
    		}
    	};

    	return [
    		isGameOver,
    		cells,
    		score,
    		showInfo,
    		numCols,
    		numRows,
    		shrink,
    		grow,
    		restart,
    		handleKeydown,
    		clearAndMove,
    		moveUp,
    		moveDown,
    		moveLeft,
    		moveRight,
    		forwardIterator,
    		backwardIterator,
    		getNextRow,
    		getPreviousRow,
    		getNextColumn,
    		getPreviousColumn,
    		getCellAt,
    		board_cells_binding,
    		board_numCols_binding,
    		board_numRows_binding,
    		up_handler,
    		down_handler,
    		left_handler,
    		right_handler,
    		restart_handler,
    		shrink_handler,
    		grow_handler,
    		showInfo_handler,
    		infodialog_showDialog_binding,
    		gameoverdialog_showDialog_binding
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				forwardIterator: 15,
    				backwardIterator: 16,
    				getNextRow: 17,
    				getPreviousRow: 18,
    				getNextColumn: 19,
    				getPreviousColumn: 20,
    				getCellAt: 21
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get forwardIterator() {
    		return forwardIterator;
    	}

    	set forwardIterator(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backwardIterator() {
    		return backwardIterator;
    	}

    	set backwardIterator(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getNextRow() {
    		return this.$$.ctx[17];
    	}

    	set getNextRow(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getPreviousRow() {
    		return this.$$.ctx[18];
    	}

    	set getPreviousRow(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getNextColumn() {
    		return this.$$.ctx[19];
    	}

    	set getNextColumn(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getPreviousColumn() {
    		return this.$$.ctx[20];
    	}

    	set getPreviousColumn(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getCellAt() {
    		return getCellAt;
    	}

    	set getCellAt(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t0;
    	let githubcorner;
    	let t1;
    	let main;
    	let game;
    	let t2;
    	let installer;
    	let current;

    	githubcorner = new GithubCorner({
    			props: {
    				href: "https://github.com/loremdipso/YAN2048_Svelte"
    			},
    			$$inline: true
    		});

    	game = new Game({ $$inline: true });
    	installer = new Installer({ $$inline: true });

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t0 = space();
    			create_component(githubcorner.$$.fragment);
    			t1 = space();
    			main = element("main");
    			create_component(game.$$.fragment);
    			t2 = space();
    			create_component(installer.$$.fragment);
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "href", "https://fonts.googleapis.com/icon?family=Material+Icons");
    			add_location(link0, file, 7, 1, 222);
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700");
    			add_location(link1, file, 12, 1, 334);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "https://fonts.googleapis.com/css?family=Roboto+Mono");
    			add_location(link2, file, 17, 1, 462);
    			attr_dev(main, "class", "fade-in svelte-1eogsiq");
    			add_location(main, file, 25, 0, 638);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			insert_dev(target, t0, anchor);
    			mount_component(githubcorner, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(game, main, null);
    			append_dev(main, t2);
    			mount_component(installer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(githubcorner.$$.fragment, local);
    			transition_in(game.$$.fragment, local);
    			transition_in(installer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(githubcorner.$$.fragment, local);
    			transition_out(game.$$.fragment, local);
    			transition_out(installer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			if (detaching) detach_dev(t0);
    			destroy_component(githubcorner, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(game);
    			destroy_component(installer);
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
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ GithubCorner, Installer, Game });
    	return [];
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
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
