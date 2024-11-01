const Module = typeof Module != "undefined" ? Module : {};
const ENVIRONMENT_IS_WEB = typeof window == "object";
const ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
const ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
if (ENVIRONMENT_IS_NODE) {}
const moduleOverrides = Object.assign({}, Module);
const arguments_ = [];
const thisProgram = "./this.program";
const quit_ = (status, toThrow) => {
    throw toThrow
};
const scriptDirectory = "";

function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    }
    return scriptDirectory + path
}
const readAsync, readBinary;
if (ENVIRONMENT_IS_NODE) {
    const fs = require("fs");
    const nodePath = require("path");
    scriptDirectory = __dirname + "/";
    readBinary = filename => {
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
        const ret = fs.readFileSync(filename);
        return ret
    };
    readAsync = (filename, binary = true) => {
        filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
        return new Promise((resolve, reject) => {
            fs.readFile(filename, binary ? undefined : "utf8", (err, data) => {
                if (err) reject(err);
                else resolve(binary ? data.buffer : data)
            })
        })
    };
    if (!Module["thisProgram"] && process.argv.length > 1) {
        thisProgram = process.argv[1].replace(/\\/g, "/")
    }
    arguments_ = process.argv.slice(2);
    if (typeof module != "undefined") {
        module["exports"] = Module
    }
    quit_ = (status, toThrow) => {
        process.exitCode = status;
        throw toThrow
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
    } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src
    }
    if (scriptDirectory.startsWith("blob:")) {
        scriptDirectory = ""
    } else {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
    } {
        if (ENVIRONMENT_IS_WORKER) {
            readBinary = url => {
                const xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response)
            }
        }
        readAsync = url => {
            if (isFileURI(url)) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest;
                    xhr.open("GET", url, true);
                    xhr.responseType = "arraybuffer";
                    xhr.onload = () => {
                        if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                            resolve(xhr.response);
                            return
                        }
                        reject(xhr.status)
                    };
                    xhr.onerror = reject;
                    xhr.send(null)
                })
            }
            return fetch(url, {
                credentials: "same-origin"
            }).then(response => {
                if (response.ok) {
                    return response.arrayBuffer()
                }
                return Promise.reject(new Error(response.status + " : " + response.url))
            })
        }
    }
} else {}
const out = Module["print"] || console.log.bind(console);
const err = Module["printErr"] || console.error.bind(console);
Object.assign(Module, moduleOverrides);
moduleOverrides = null;
if (Module["arguments"]) arguments_ = Module["arguments"];
if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
const wasmBinary = Module["wasmBinary"];
const wasmMemory;
const ABORT = false;
const EXITSTATUS;
const HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateMemoryViews() {
    const b = wasmMemory.buffer;
    Module["HEAP8"] = HEAP8 = new Int8Array(b);
    Module["HEAP16"] = HEAP16 = new Int16Array(b);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
    Module["HEAP32"] = HEAP32 = new Int32Array(b);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(b)
}
const __ATPRERUN__ = [];
const __ATINIT__ = [];
const __ATMAIN__ = [];
const __ATPOSTRUN__ = [];
const runtimeInitialized = false;

function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}

function initRuntime() {
    runtimeInitialized = true;
    if (!Module["noFSInit"] && !FS.initialized) FS.init();
    FS.ignorePermissions = false;
    TTY.init();
    callRuntimeCallbacks(__ATINIT__)
}

function preMain() {
    callRuntimeCallbacks(__ATMAIN__)
}

function postRun() {
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}

function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}

function addOnInit(cb) {
    __ATINIT__.unshift(cb)
}

function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}
const runDependencies = 0;
const runDependencyWatcher = null;
const dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
    return id
}

function addRunDependency(id) {
    runDependencies++;
    Module["monitorRunDependencies"]?.(runDependencies)
}

function removeRunDependency(id) {
    runDependencies--;
    Module["monitorRunDependencies"]?.(runDependencies);
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            const callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback()
        }
    }
}

function abort(what) {
    Module["onAbort"]?.(what);
    what = "Aborted(" + what + ")";
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    what += ". Build with -sASSERTIONS for more info.";
    const e = new WebAssembly.RuntimeError(what);
    throw e
}
const dataURIPrefix = "data:application/octet-stream;base64,";
const isDataURI = filename => filename.startsWith(dataURIPrefix);
const isFileURI = filename => filename.startsWith("file://");

function findWasmBinary() {
    const f = "index.wasm";
    if (!isDataURI(f)) {
        return locateFile(f)
    }
    return f
}
const wasmBinaryFile;

function getBinarySync(file) {
    if (file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary)
    }
    if (readBinary) {
        return readBinary(file)
    }
    throw "both async and sync fetching of the wasm failed"
}

function getBinaryPromise(binaryFile) {
    if (!wasmBinary) {
        return readAsync(binaryFile).then(response => new Uint8Array(response), () => getBinarySync(binaryFile))
    }
    return Promise.resolve().then(() => getBinarySync(binaryFile))
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
    return getBinaryPromise(binaryFile).then(binary => WebAssembly.instantiate(binary, imports)).then(receiver, reason => {
        err(`failed to asynchronously prepare wasm: ${reason}`);
        abort(reason)
    })
}

function instantiateAsync(binary, binaryFile, imports, callback) {
    if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
        return fetch(binaryFile, {
            credentials: "same-origin"
        }).then(response => {
            const result = WebAssembly.instantiateStreaming(response, imports);
            return result.then(callback, function(reason) {
                err(`wasm streaming compile failed: ${reason}`);
                err("falling back to ArrayBuffer instantiation");
                return instantiateArrayBuffer(binaryFile, imports, callback)
            })
        })
    }
    return instantiateArrayBuffer(binaryFile, imports, callback)
}

function getWasmImports() {
    return {
        a: wasmImports
    }
}

function createWasm() {
    const info = getWasmImports();

    function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmMemory = wasmExports["ib"];
        updateMemoryViews();
        wasmTable = wasmExports["lb"];
        addOnInit(wasmExports["jb"]);
        removeRunDependency("wasm-instantiate");
        return wasmExports
    }
    addRunDependency("wasm-instantiate");

    function receiveInstantiationResult(result) {
        receiveInstance(result["instance"])
    }
    if (Module["instantiateWasm"]) {
        try {
            return Module["instantiateWasm"](info, receiveInstance)
        } catch (e) {
            err(`Module.instantiateWasm callback failed with error: ${e}`);
            return false
        }
    }
    if (!wasmBinaryFile) wasmBinaryFile = findWasmBinary();
    instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult);
    return {}
}
const tempDouble;
const tempI64;
const ASM_CONSTS = {
    16672: () => {
        if (document.fullscreenElement) return 1
    },
    16718: () => document.getElementById("canvas").width,
    16770: () => parseInt(document.getElementById("canvas").style.width),
    16838: () => {
        document.exitFullscreen()
    },
    16865: () => {
        setTimeout(function() {
            Module.requestFullscreen(false, false)
        }, 100)
    },
    16938: () => {
        if (document.fullscreenElement) return 1
    },
    16984: () => document.getElementById("canvas").width,
    17036: () => screen.width,
    17061: () => {
        document.exitFullscreen()
    },
    17088: () => {
        setTimeout(function() {
            Module.requestFullscreen(false, true);
            setTimeout(function() {
                canvas.style.width = "unset"
            }, 100)
        }, 100)
    },
    17221: () => {
        if (document.fullscreenElement) return 1
    },
    17267: () => document.getElementById("canvas").width,
    17319: () => parseInt(document.getElementById("canvas").style.width),
    17387: () => {
        if (document.fullscreenElement) return 1
    },
    17433: () => document.getElementById("canvas").width,
    17485: () => screen.width,
    17510: () => {
        if (document.fullscreenElement) return 1
    },
    17556: () => document.getElementById("canvas").width,
    17608: () => screen.width,
    17633: () => {
        document.exitFullscreen()
    },
    17660: () => {
        if (document.fullscreenElement) return 1
    },
    17706: () => document.getElementById("canvas").width,
    17758: () => parseInt(document.getElementById("canvas").style.width),
    17826: () => {
        document.exitFullscreen()
    },
    17853: () => screen.width,
    17878: () => screen.height,
    17904: () => window.screenX,
    17931: () => window.screenY,
    17958: $0 => {
        navigator.clipboard.writeText(UTF8ToString($0))
    },
    18011: $0 => {
        document.getElementById("canvas").style.cursor = UTF8ToString($0)
    },
    18082: () => {
        document.getElementById("canvas").style.cursor = "none"
    },
    18139: $0 => {
        document.getElementById("canvas").style.cursor = UTF8ToString($0)
    },
    18210: () => {
        if (document.fullscreenElement) return 1
    },
    18256: () => {
        if (document.pointerLockElement) return 1
    }
};

function GetWindowInnerWidth() {
    return window.innerWidth
}

function GetWindowInnerHeight() {
    return window.innerHeight
}

function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = `Program terminated with exit(${status})`;
    this.status = status
}
const callRuntimeCallbacks = callbacks => {
    while (callbacks.length > 0) {
        callbacks.shift()(Module)
    }
};
const noExitRuntime = Module["noExitRuntime"] || true;
const UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;
const UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
    const endIdx = idx + maxBytesToRead;
    const endPtr = idx;
    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
    }
    const str = "";
    while (idx < endPtr) {
        const u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue
        }
        const u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue
        }
        const u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2
        } else {
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
        }
        if (u0 < 65536) {
            str += String.fromCharCode(u0)
        } else {
            const ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
        }
    }
    return str
};
const UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
const ___assert_fail = (condition, filename, line, func) => {
    abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"])
};
const PATH = {
    isAbs: path => path.charAt(0) === "/",
    splitPath: filename => {
        const splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1)
    },
    normalizeArray: (parts, allowAboveRoot) => {
        const up = 0;
        for (const i = parts.length - 1; i >= 0; i--) {
            const last = parts[i];
            if (last === ".") {
                parts.splice(i, 1)
            } else if (last === "..") {
                parts.splice(i, 1);
                up++
            } else if (up) {
                parts.splice(i, 1);
                up--
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..")
            }
        }
        return parts
    },
    normalize: path => {
        const isAbsolute = PATH.isAbs(path),
            trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
            path = "."
        }
        if (path && trailingSlash) {
            path += "/"
        }
        return (isAbsolute ? "/" : "") + path
    },
    dirname: path => {
        const result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
            return "."
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1)
        }
        return root + dir
    },
    basename: path => {
        if (path === "/") return "/";
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        const lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) return path;
        return path.substr(lastSlash + 1)
    },
    join: (...paths) => PATH.normalize(paths.join("/")),
    join2: (l, r) => PATH.normalize(l + "/" + r)
};
const initRandomFill = () => {
    if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
        return view => crypto.getRandomValues(view)
    } else if (ENVIRONMENT_IS_NODE) {
        try {
            const crypto_module = require("crypto");
            const randomFillSync = crypto_module["randomFillSync"];
            if (randomFillSync) {
                return view => crypto_module["randomFillSync"](view)
            }
            const randomBytes = crypto_module["randomBytes"];
            return view => (view.set(randomBytes(view.byteLength)), view)
        } catch (e) {}
    }
    abort("initRandomDevice")
};
const randomFill = view => (randomFill = initRandomFill())(view);
const PATH_FS = {
    resolve: (...args) => {
        const resolvedPath = "",
            resolvedAbsolute = false;
        for (const i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            const path = i >= 0 ? args[i] : FS.cwd();
            if (typeof path != "string") {
                throw new TypeError("Arguments to path.resolve must be strings")
            } else if (!path) {
                return ""
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = PATH.isAbs(path)
        }
        resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || "."
    },
    relative: (from, to) => {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);

        function trim(arr) {
            const start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== "") break
            }
            const end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== "") break
            }
            if (start > end) return [];
            return arr.slice(start, end - start + 1)
        }
        const fromParts = trim(from.split("/"));
        const toParts = trim(to.split("/"));
        const length = Math.min(fromParts.length, toParts.length);
        const samePartsLength = length;
        for (const i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break
            }
        }
        const outputParts = [];
        for (const i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..")
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/")
    }
};
const FS_stdin_getChar_buffer = [];
const lengthBytesUTF8 = str => {
    const len = 0;
    for (const i = 0; i < str.length; ++i) {
        const c = str.charCodeAt(i);
        if (c <= 127) {
            len++
        } else if (c <= 2047) {
            len += 2
        } else if (c >= 55296 && c <= 57343) {
            len += 4;
            ++i
        } else {
            len += 3
        }
    }
    return len
};
const stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
    if (!(maxBytesToWrite > 0)) return 0;
    const startIdx = outIdx;
    const endIdx = outIdx + maxBytesToWrite - 1;
    for (const i = 0; i < str.length; ++i) {
        const u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            const u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | u >> 6;
            heap[outIdx++] = 128 | u & 63
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | u >> 12;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63
        } else {
            if (outIdx + 3 >= endIdx) break;
            heap[outIdx++] = 240 | u >> 18;
            heap[outIdx++] = 128 | u >> 12 & 63;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63
        }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx
};

function intArrayFromString(stringy, dontAddNull, length) {
    const len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    const u8array = new Array(len);
    const numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array
}
const FS_stdin_getChar = () => {
    if (!FS_stdin_getChar_buffer.length) {
        const result = null;
        if (ENVIRONMENT_IS_NODE) {
            const BUFSIZE = 256;
            const buf = Buffer.alloc(BUFSIZE);
            const bytesRead = 0;
            const fd = process.stdin.fd;
            try {
                bytesRead = fs.readSync(fd, buf, 0, BUFSIZE)
            } catch (e) {
                if (e.toString().includes("EOF")) bytesRead = 0;
                else throw e
            }
            if (bytesRead > 0) {
                result = buf.slice(0, bytesRead).toString("utf-8")
            }
        } else if (typeof window != "undefined" && typeof window.prompt == "function") {
            result = window.prompt("Input: ");
            if (result !== null) {
                result += "\n"
            }
        } else {}
        if (!result) {
            return null
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true)
    }
    return FS_stdin_getChar_buffer.shift()
};
const TTY = {
    ttys: [],
    init() {},
    shutdown() {},
    register(dev, ops) {
        TTY.ttys[dev] = {
            input: [],
            output: [],
            ops: ops
        };
        FS.registerDevice(dev, TTY.stream_ops)
    },
    stream_ops: {
        open(stream) {
            const tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
                throw new FS.ErrnoError(43)
            }
            stream.tty = tty;
            stream.seekable = false
        },
        close(stream) {
            stream.tty.ops.fsync(stream.tty)
        },
        fsync(stream) {
            stream.tty.ops.fsync(stream.tty)
        },
        read(stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(60)
            }
            const bytesRead = 0;
            for (const i = 0; i < length; i++) {
                const result;
                try {
                    result = stream.tty.ops.get_char(stream.tty)
                } catch (e) {
                    throw new FS.ErrnoError(29)
                }
                if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(6)
                }
                if (result === null || result === undefined) break;
                bytesRead++;
                buffer[offset + i] = result
            }
            if (bytesRead) {
                stream.node.timestamp = Date.now()
            }
            return bytesRead
        },
        write(stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(60)
            }
            try {
                for (const i = 0; i < length; i++) {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i])
                }
            } catch (e) {
                throw new FS.ErrnoError(29)
            }
            if (length) {
                stream.node.timestamp = Date.now()
            }
            return i
        }
    },
    default_tty_ops: {
        get_char(tty) {
            return FS_stdin_getChar()
        },
        put_char(tty, val) {
            if (val === null || val === 10) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0) tty.output.push(val)
            }
        },
        fsync(tty) {
            if (tty.output && tty.output.length > 0) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        },
        ioctl_tcgets(tty) {
            return {
                c_iflag: 25856,
                c_oflag: 5,
                c_cflag: 191,
                c_lflag: 35387,
                c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }
        },
        ioctl_tcsets(tty, optional_actions, data) {
            return 0
        },
        ioctl_tiocgwinsz(tty) {
            return [24, 80]
        }
    },
    default_tty1_ops: {
        put_char(tty, val) {
            if (val === null || val === 10) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            } else {
                if (val != 0) tty.output.push(val)
            }
        },
        fsync(tty) {
            if (tty.output && tty.output.length > 0) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = []
            }
        }
    }
};
const mmapAlloc = size => {
    abort()
};
const MEMFS = {
    ops_table: null,
    mount(mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0)
    },
    createNode(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63)
        }
        MEMFS.ops_table ||= {
            dir: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr,
                    lookup: MEMFS.node_ops.lookup,
                    mknod: MEMFS.node_ops.mknod,
                    rename: MEMFS.node_ops.rename,
                    unlink: MEMFS.node_ops.unlink,
                    rmdir: MEMFS.node_ops.rmdir,
                    readdir: MEMFS.node_ops.readdir,
                    symlink: MEMFS.node_ops.symlink
                },
                stream: {
                    llseek: MEMFS.stream_ops.llseek
                }
            },
            file: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr
                },
                stream: {
                    llseek: MEMFS.stream_ops.llseek,
                    read: MEMFS.stream_ops.read,
                    write: MEMFS.stream_ops.write,
                    allocate: MEMFS.stream_ops.allocate,
                    mmap: MEMFS.stream_ops.mmap,
                    msync: MEMFS.stream_ops.msync
                }
            },
            link: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr,
                    readlink: MEMFS.node_ops.readlink
                },
                stream: {}
            },
            chrdev: {
                node: {
                    getattr: MEMFS.node_ops.getattr,
                    setattr: MEMFS.node_ops.setattr
                },
                stream: FS.chrdev_stream_ops
            }
        };
        const node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {}
        } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null
        } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream
        } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream
        }
        node.timestamp = Date.now();
        if (parent) {
            parent.contents[name] = node;
            parent.timestamp = node.timestamp
        }
        return node
    },
    getFileDataAsTypedArray(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
        return new Uint8Array(node.contents)
    },
    expandFileStorage(node, newCapacity) {
        const prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return;
        const CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
        const oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0)
    },
    resizeFileStorage(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0
        } else {
            const oldContents = node.contents;
            node.contents = new Uint8Array(newSize);
            if (oldContents) {
                node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)))
            }
            node.usedBytes = newSize
        }
    },
    node_ops: {
        getattr(node) {
            const attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
                attr.size = 4096
            } else if (FS.isFile(node.mode)) {
                attr.size = node.usedBytes
            } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length
            } else {
                attr.size = 0
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr
        },
        setattr(node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp
            }
            if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size)
            }
        },
        lookup(parent, name) {
            throw FS.genericErrors[44]
        },
        mknod(parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev)
        },
        rename(old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
                const new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name)
                } catch (e) {}
                if (new_node) {
                    for (const i in new_node.contents) {
                        throw new FS.ErrnoError(55)
                    }
                }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.parent.timestamp = Date.now();
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            new_dir.timestamp = old_node.parent.timestamp
        },
        unlink(parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now()
        },
        rmdir(parent, name) {
            const node = FS.lookupNode(parent, name);
            for (const i in node.contents) {
                throw new FS.ErrnoError(55)
            }
            delete parent.contents[name];
            parent.timestamp = Date.now()
        },
        readdir(node) {
            const entries = [".", ".."];
            for (const key of Object.keys(node.contents)) {
                entries.push(key)
            }
            return entries
        },
        symlink(parent, newname, oldpath) {
            const node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node
        },
        readlink(node) {
            if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(28)
            }
            return node.link
        }
    },
    stream_ops: {
        read(stream, buffer, offset, length, position) {
            const contents = stream.node.contents;
            if (position >= stream.node.usedBytes) return 0;
            const size = Math.min(stream.node.usedBytes - position, length);
            if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset)
            } else {
                for (const i = 0; i < size; i++) buffer[offset + i] = contents[position + i]
            }
            return size
        },
        write(stream, buffer, offset, length, position, canOwn) {
            if (!length) return 0;
            const node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length
                } else if (node.usedBytes === 0 && position === 0) {
                    node.contents = buffer.slice(offset, offset + length);
                    node.usedBytes = length;
                    return length
                } else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length
                }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) {
                node.contents.set(buffer.subarray(offset, offset + length), position)
            } else {
                for (const i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i]
                }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length
        },
        llseek(stream, offset, whence) {
            const position = offset;
            if (whence === 1) {
                position += stream.position
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(28)
            }
            return position
        },
        allocate(stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length)
        },
        mmap(stream, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43)
            }
            const ptr;
            const allocated;
            const contents = stream.node.contents;
            if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
                allocated = false;
                ptr = contents.byteOffset
            } else {
                allocated = true;
                ptr = mmapAlloc(length);
                if (!ptr) {
                    throw new FS.ErrnoError(48)
                }
                if (contents) {
                    if (position > 0 || position + length < contents.length) {
                        if (contents.subarray) {
                            contents = contents.subarray(position, position + length)
                        } else {
                            contents = Array.prototype.slice.call(contents, position, position + length)
                        }
                    }
                    HEAP8.set(contents, ptr)
                }
            }
            return {
                ptr: ptr,
                allocated: allocated
            }
        },
        msync(stream, buffer, offset, length, mmapFlags) {
            MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0
        }
    }
};
const asyncLoad = (url, onload, onerror, noRunDep) => {
    const dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
    readAsync(url).then(arrayBuffer => {
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep)
    }, err => {
        if (onerror) {
            onerror()
        } else {
            throw `Loading data file "${url}" failed.`
        }
    });
    if (dep) addRunDependency(dep)
};
const FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
    FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn)
};
const preloadPlugins = Module["preloadPlugins"] || [];
const FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
    if (typeof Browser != "undefined") Browser.init();
    const handled = false;
    preloadPlugins.forEach(plugin => {
        if (handled) return;
        if (plugin["canHandle"](fullname)) {
            plugin["handle"](byteArray, fullname, finish, onerror);
            handled = true
        }
    });
    return handled
};
const FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
    const fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
    const dep = getUniqueRunDependency(`cp ${fullname}`);

    function processData(byteArray) {
        function finish(byteArray) {
            preFinish?.();
            if (!dontCreateFile) {
                FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn)
            }
            onload?.();
            removeRunDependency(dep)
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
                onerror?.();
                removeRunDependency(dep)
            })) {
            return
        }
        finish(byteArray)
    }
    addRunDependency(dep);
    if (typeof url == "string") {
        asyncLoad(url, processData, onerror)
    } else {
        processData(url)
    }
};
const FS_modeStringToFlags = str => {
    const flagModes = {
        r: 0,
        "r+": 2,
        w: 512 | 64 | 1,
        "w+": 512 | 64 | 2,
        a: 1024 | 64 | 1,
        "a+": 1024 | 64 | 2
    };
    const flags = flagModes[str];
    if (typeof flags == "undefined") {
        throw new Error(`Unknown file open mode: ${str}`)
    }
    return flags
};
const FS_getMode = (canRead, canWrite) => {
    const mode = 0;
    if (canRead) mode |= 292 | 73;
    if (canWrite) mode |= 146;
    return mode
};
const FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: false,
    ignorePermissions: true,
    ErrnoError: class {
        constructor(errno) {
            this.name = "ErrnoError";
            this.errno = errno
        }
    },
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    FSStream: class {
        constructor() {
            this.shared = {}
        }
        get object() {
            return this.node
        }
        set object(val) {
            this.node = val
        }
        get isRead() {
            return (this.flags & 2097155) !== 1
        }
        get isWrite() {
            return (this.flags & 2097155) !== 0
        }
        get isAppend() {
            return this.flags & 1024
        }
        get flags() {
            return this.shared.flags
        }
        set flags(val) {
            this.shared.flags = val
        }
        get position() {
            return this.shared.position
        }
        set position(val) {
            this.shared.position = val
        }
    },
    FSNode: class {
        constructor(parent, name, mode, rdev) {
            if (!parent) {
                parent = this
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
            this.readMode = 292 | 73;
            this.writeMode = 146
        }
        get read() {
            return (this.mode & this.readMode) === this.readMode
        }
        set read(val) {
            val ? this.mode |= this.readMode : this.mode &= ~this.readMode
        }
        get write() {
            return (this.mode & this.writeMode) === this.writeMode
        }
        set write(val) {
            val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode
        }
        get isFolder() {
            return FS.isDir(this.mode)
        }
        get isDevice() {
            return FS.isChrdev(this.mode)
        }
    },
    lookupPath(path, opts = {}) {
        path = PATH_FS.resolve(path);
        if (!path) return {
            path: "",
            node: null
        };
        const defaults = {
            follow_mount: true,
            recurse_count: 0
        };
        opts = Object.assign(defaults, opts);
        if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32)
        }
        const parts = path.split("/").filter(p => !!p);
        const current = FS.root;
        const current_path = "/";
        for (const i = 0; i < parts.length; i++) {
            const islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || islast && opts.follow_mount) {
                    current = current.mounted.root
                }
            }
            if (!islast || opts.follow) {
                const count = 0;
                while (FS.isLink(current.mode)) {
                    const link = FS.readlink(current_path);
                    current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                    const lookup = FS.lookupPath(current_path, {
                        recurse_count: opts.recurse_count + 1
                    });
                    current = lookup.node;
                    if (count++ > 40) {
                        throw new FS.ErrnoError(32)
                    }
                }
            }
        }
        return {
            path: current_path,
            node: current
        }
    },
    getPath(node) {
        const path;
        while (true) {
            if (FS.isRoot(node)) {
                const mount = node.mount.mountpoint;
                if (!path) return mount;
                return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path
            }
            path = path ? `${node.name}/${path}` : node.name;
            node = node.parent
        }
    },
    hashName(parentid, name) {
        const hash = 0;
        for (const i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i) | 0
        }
        return (parentid + hash >>> 0) % FS.nameTable.length
    },
    hashAddNode(node) {
        const hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node
    },
    hashRemoveNode(node) {
        const hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next
        } else {
            const current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break
                }
                current = current.name_next
            }
        }
    },
    lookupNode(parent, name) {
        const errCode = FS.mayLookup(parent);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        const hash = FS.hashName(parent.id, name);
        for (const node = FS.nameTable[hash]; node; node = node.name_next) {
            const nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node
            }
        }
        return FS.lookup(parent, name)
    },
    createNode(parent, name, mode, rdev) {
        const node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node
    },
    destroyNode(node) {
        FS.hashRemoveNode(node)
    },
    isRoot(node) {
        return node === node.parent
    },
    isMountpoint(node) {
        return !!node.mounted
    },
    isFile(mode) {
        return (mode & 61440) === 32768
    },
    isDir(mode) {
        return (mode & 61440) === 16384
    },
    isLink(mode) {
        return (mode & 61440) === 40960
    },
    isChrdev(mode) {
        return (mode & 61440) === 8192
    },
    isBlkdev(mode) {
        return (mode & 61440) === 24576
    },
    isFIFO(mode) {
        return (mode & 61440) === 4096
    },
    isSocket(mode) {
        return (mode & 49152) === 49152
    },
    flagsToPermissionString(flag) {
        const perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
            perms += "w"
        }
        return perms
    },
    nodePermissions(node, perms) {
        if (FS.ignorePermissions) {
            return 0
        }
        if (perms.includes("r") && !(node.mode & 292)) {
            return 2
        } else if (perms.includes("w") && !(node.mode & 146)) {
            return 2
        } else if (perms.includes("x") && !(node.mode & 73)) {
            return 2
        }
        return 0
    },
    mayLookup(dir) {
        if (!FS.isDir(dir.mode)) return 54;
        const errCode = FS.nodePermissions(dir, "x");
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0
    },
    mayCreate(dir, name) {
        try {
            const node = FS.lookupNode(dir, name);
            return 20
        } catch (e) {}
        return FS.nodePermissions(dir, "wx")
    },
    mayDelete(dir, name, isdir) {
        const node;
        try {
            node = FS.lookupNode(dir, name)
        } catch (e) {
            return e.errno
        }
        const errCode = FS.nodePermissions(dir, "wx");
        if (errCode) {
            return errCode
        }
        if (isdir) {
            if (!FS.isDir(node.mode)) {
                return 54
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return 10
            }
        } else {
            if (FS.isDir(node.mode)) {
                return 31
            }
        }
        return 0
    },
    mayOpen(node, flags) {
        if (!node) {
            return 44
        }
        if (FS.isLink(node.mode)) {
            return 32
        } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                return 31
            }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags))
    },
    MAX_OPEN_FDS: 4096,
    nextfd() {
        for (const fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
            if (!FS.streams[fd]) {
                return fd
            }
        }
        throw new FS.ErrnoError(33)
    },
    getStreamChecked(fd) {
        const stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8)
        }
        return stream
    },
    getStream: fd => FS.streams[fd],
    createStream(stream, fd = -1) {
        stream = Object.assign(new FS.FSStream, stream);
        if (fd == -1) {
            fd = FS.nextfd()
        }
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream
    },
    closeStream(fd) {
        FS.streams[fd] = null
    },
    dupStream(origStream, fd = -1) {
        const stream = FS.createStream(origStream, fd);
        stream.stream_ops?.dup?.(stream);
        return stream
    },
    chrdev_stream_ops: {
        open(stream) {
            const device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            stream.stream_ops.open?.(stream)
        },
        llseek() {
            throw new FS.ErrnoError(70)
        }
    },
    major: dev => dev >> 8,
    minor: dev => dev & 255,
    makedev: (ma, mi) => ma << 8 | mi,
    registerDevice(dev, ops) {
        FS.devices[dev] = {
            stream_ops: ops
        }
    },
    getDevice: dev => FS.devices[dev],
    getMounts(mount) {
        const mounts = [];
        const check = [mount];
        while (check.length) {
            const m = check.pop();
            mounts.push(m);
            check.push(...m.mounts)
        }
        return mounts
    },
    syncfs(populate, callback) {
        if (typeof populate == "function") {
            callback = populate;
            populate = false
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
            err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`)
        }
        const mounts = FS.getMounts(FS.root.mount);
        const completed = 0;

        function doCallback(errCode) {
            FS.syncFSRequests--;
            return callback(errCode)
        }

        function done(errCode) {
            if (errCode) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(errCode)
                }
                return
            }
            if (++completed >= mounts.length) {
                doCallback(null)
            }
        }
        mounts.forEach(mount => {
            if (!mount.type.syncfs) {
                return done(null)
            }
            mount.type.syncfs(mount, populate, done)
        })
    },
    mount(type, opts, mountpoint) {
        const root = mountpoint === "/";
        const pseudo = !mountpoint;
        const node;
        if (root && FS.root) {
            throw new FS.ErrnoError(10)
        } else if (!root && !pseudo) {
            const lookup = FS.lookupPath(mountpoint, {
                follow_mount: false
            });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10)
            }
            if (!FS.isDir(node.mode)) {
                throw new FS.ErrnoError(54)
            }
        }
        const mount = {
            type: type,
            opts: opts,
            mountpoint: mountpoint,
            mounts: []
        };
        const mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
            FS.root = mountRoot
        } else if (node) {
            node.mounted = mount;
            if (node.mount) {
                node.mount.mounts.push(mount)
            }
        }
        return mountRoot
    },
    unmount(mountpoint) {
        const lookup = FS.lookupPath(mountpoint, {
            follow_mount: false
        });
        if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28)
        }
        const node = lookup.node;
        const mount = node.mounted;
        const mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach(hash => {
            const current = FS.nameTable[hash];
            while (current) {
                const next = current.name_next;
                if (mounts.includes(current.mount)) {
                    FS.destroyNode(current)
                }
                current = next
            }
        });
        node.mounted = null;
        const idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1)
    },
    lookup(parent, name) {
        return parent.node_ops.lookup(parent, name)
    },
    mknod(path, mode, dev) {
        const lookup = FS.lookupPath(path, {
            parent: true
        });
        const parent = lookup.node;
        const name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
            throw new FS.ErrnoError(28)
        }
        const errCode = FS.mayCreate(parent, name);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63)
        }
        return parent.node_ops.mknod(parent, name, mode, dev)
    },
    create(path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0)
    },
    mkdir(path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0)
    },
    mkdirTree(path, mode) {
        const dirs = path.split("/");
        const d = "";
        for (const i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) continue;
            d += "/" + dirs[i];
            try {
                FS.mkdir(d, mode)
            } catch (e) {
                if (e.errno != 20) throw e
            }
        }
    },
    mkdev(path, mode, dev) {
        if (typeof dev == "undefined") {
            dev = mode;
            mode = 438
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev)
    },
    symlink(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44)
        }
        const lookup = FS.lookupPath(newpath, {
            parent: true
        });
        const parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44)
        }
        const newname = PATH.basename(newpath);
        const errCode = FS.mayCreate(parent, newname);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63)
        }
        return parent.node_ops.symlink(parent, newname, oldpath)
    },
    rename(old_path, new_path) {
        const old_dirname = PATH.dirname(old_path);
        const new_dirname = PATH.dirname(new_path);
        const old_name = PATH.basename(old_path);
        const new_name = PATH.basename(new_path);
        const lookup, old_dir, new_dir;
        lookup = FS.lookupPath(old_path, {
            parent: true
        });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, {
            parent: true
        });
        new_dir = lookup.node;
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75)
        }
        const old_node = FS.lookupNode(old_dir, old_name);
        const relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(28)
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(55)
        }
        const new_node;
        try {
            new_node = FS.lookupNode(new_dir, new_name)
        } catch (e) {}
        if (old_node === new_node) {
            return
        }
        const isdir = FS.isDir(old_node.mode);
        const errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
            throw new FS.ErrnoError(10)
        }
        if (new_dir !== old_dir) {
            errCode = FS.nodePermissions(old_dir, "w");
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
        }
        FS.hashRemoveNode(old_node);
        try {
            old_dir.node_ops.rename(old_node, new_dir, new_name);
            old_node.parent = new_dir
        } catch (e) {
            throw e
        } finally {
            FS.hashAddNode(old_node)
        }
    },
    rmdir(path) {
        const lookup = FS.lookupPath(path, {
            parent: true
        });
        const parent = lookup.node;
        const name = PATH.basename(path);
        const node = FS.lookupNode(parent, name);
        const errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10)
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node)
    },
    readdir(path) {
        const lookup = FS.lookupPath(path, {
            follow: true
        });
        const node = lookup.node;
        if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54)
        }
        return node.node_ops.readdir(node)
    },
    unlink(path) {
        const lookup = FS.lookupPath(path, {
            parent: true
        });
        const parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44)
        }
        const name = PATH.basename(path);
        const node = FS.lookupNode(parent, name);
        const errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10)
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node)
    },
    readlink(path) {
        const lookup = FS.lookupPath(path);
        const link = lookup.node;
        if (!link) {
            throw new FS.ErrnoError(44)
        }
        if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28)
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link))
    },
    stat(path, dontFollow) {
        const lookup = FS.lookupPath(path, {
            follow: !dontFollow
        });
        const node = lookup.node;
        if (!node) {
            throw new FS.ErrnoError(44)
        }
        if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63)
        }
        return node.node_ops.getattr(node)
    },
    lstat(path) {
        return FS.stat(path, true)
    },
    chmod(path, mode, dontFollow) {
        const node;
        if (typeof path == "string") {
            const lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        node.node_ops.setattr(node, {
            mode: mode & 4095 | node.mode & ~4095,
            timestamp: Date.now()
        })
    },
    lchmod(path, mode) {
        FS.chmod(path, mode, true)
    },
    fchmod(fd, mode) {
        const stream = FS.getStreamChecked(fd);
        FS.chmod(stream.node, mode)
    },
    chown(path, uid, gid, dontFollow) {
        const node;
        if (typeof path == "string") {
            const lookup = FS.lookupPath(path, {
                follow: !dontFollow
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        node.node_ops.setattr(node, {
            timestamp: Date.now()
        })
    },
    lchown(path, uid, gid) {
        FS.chown(path, uid, gid, true)
    },
    fchown(fd, uid, gid) {
        const stream = FS.getStreamChecked(fd);
        FS.chown(stream.node, uid, gid)
    },
    truncate(path, len) {
        if (len < 0) {
            throw new FS.ErrnoError(28)
        }
        const node;
        if (typeof path == "string") {
            const lookup = FS.lookupPath(path, {
                follow: true
            });
            node = lookup.node
        } else {
            node = path
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63)
        }
        if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28)
        }
        const errCode = FS.nodePermissions(node, "w");
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        node.node_ops.setattr(node, {
            size: len,
            timestamp: Date.now()
        })
    },
    ftruncate(fd, len) {
        const stream = FS.getStreamChecked(fd);
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28)
        }
        FS.truncate(stream.node, len)
    },
    utime(path, atime, mtime) {
        const lookup = FS.lookupPath(path, {
            follow: true
        });
        const node = lookup.node;
        node.node_ops.setattr(node, {
            timestamp: Math.max(atime, mtime)
        })
    },
    open(path, flags, mode) {
        if (path === "") {
            throw new FS.ErrnoError(44)
        }
        flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
        if (flags & 64) {
            mode = typeof mode == "undefined" ? 438 : mode;
            mode = mode & 4095 | 32768
        } else {
            mode = 0
        }
        const node;
        if (typeof path == "object") {
            node = path
        } else {
            path = PATH.normalize(path);
            try {
                const lookup = FS.lookupPath(path, {
                    follow: !(flags & 131072)
                });
                node = lookup.node
            } catch (e) {}
        }
        const created = false;
        if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    throw new FS.ErrnoError(20)
                }
            } else {
                node = FS.mknod(path, mode, 0);
                created = true
            }
        }
        if (!node) {
            throw new FS.ErrnoError(44)
        }
        if (FS.isChrdev(node.mode)) {
            flags &= ~512
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54)
        }
        if (!created) {
            const errCode = FS.mayOpen(node, flags);
            if (errCode) {
                throw new FS.ErrnoError(errCode)
            }
        }
        if (flags & 512 && !created) {
            FS.truncate(node, 0)
        }
        flags &= ~(128 | 512 | 131072);
        const stream = FS.createStream({
            node: node,
            path: FS.getPath(node),
            flags: flags,
            seekable: true,
            position: 0,
            stream_ops: node.stream_ops,
            ungotten: [],
            error: false
        });
        if (stream.stream_ops.open) {
            stream.stream_ops.open(stream)
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
            if (!FS.readFiles) FS.readFiles = {};
            if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1
            }
        }
        return stream
    },
    close(stream) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (stream.getdents) stream.getdents = null;
        try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream)
            }
        } catch (e) {
            throw e
        } finally {
            FS.closeStream(stream.fd)
        }
        stream.fd = null
    },
    isClosed(stream) {
        return stream.fd === null
    },
    llseek(stream, offset, whence) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70)
        }
        if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28)
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position
    },
    read(stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28)
        }
        const seeking = typeof position != "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70)
        }
        const bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead
    },
    write(stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28)
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8)
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31)
        }
        if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28)
        }
        if (stream.seekable && stream.flags & 1024) {
            FS.llseek(stream, 0, 2)
        }
        const seeking = typeof position != "undefined";
        if (!seeking) {
            position = stream.position
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70)
        }
        const bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten
    },
    allocate(stream, offset, length) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8)
        }
        if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28)
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8)
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43)
        }
        if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138)
        }
        stream.stream_ops.allocate(stream, offset, length)
    },
    mmap(stream, length, position, prot, flags) {
        if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2)
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2)
        }
        if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43)
        }
        if (!length) {
            throw new FS.ErrnoError(28)
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags)
    },
    msync(stream, buffer, offset, length, mmapFlags) {
        if (!stream.stream_ops.msync) {
            return 0
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags)
    },
    ioctl(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59)
        }
        return stream.stream_ops.ioctl(stream, cmd, arg)
    },
    readFile(path, opts = {}) {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error(`Invalid encoding type "${opts.encoding}"`)
        }
        const ret;
        const stream = FS.open(path, opts.flags);
        const stat = FS.stat(path);
        const length = stat.size;
        const buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(buf, 0)
        } else if (opts.encoding === "binary") {
            ret = buf
        }
        FS.close(stream);
        return ret
    },
    writeFile(path, data, opts = {}) {
        opts.flags = opts.flags || 577;
        const stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == "string") {
            const buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            const actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn)
        } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn)
        } else {
            throw new Error("Unsupported data type")
        }
        FS.close(stream)
    },
    cwd: () => FS.currentPath,
    chdir(path) {
        const lookup = FS.lookupPath(path, {
            follow: true
        });
        if (lookup.node === null) {
            throw new FS.ErrnoError(44)
        }
        if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54)
        }
        const errCode = FS.nodePermissions(lookup.node, "x");
        if (errCode) {
            throw new FS.ErrnoError(errCode)
        }
        FS.currentPath = lookup.path
    },
    createDefaultDirectories() {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user")
    },
    createDefaultDevices() {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
            read: () => 0,
            write: (stream, buffer, offset, length, pos) => length
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        const randomBuffer = new Uint8Array(1024),
            randomLeft = 0;
        const randomByte = () => {
            if (randomLeft === 0) {
                randomLeft = randomFill(randomBuffer).byteLength
            }
            return randomBuffer[--randomLeft]
        };
        FS.createDevice("/dev", "random", randomByte);
        FS.createDevice("/dev", "urandom", randomByte);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp")
    },
    createSpecialDirectories() {
        FS.mkdir("/proc");
        const proc_self = FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount({
            mount() {
                const node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
                node.node_ops = {
                    lookup(parent, name) {
                        const fd = +name;
                        const stream = FS.getStreamChecked(fd);
                        const ret = {
                            parent: null,
                            mount: {
                                mountpoint: "fake"
                            },
                            node_ops: {
                                readlink: () => stream.path
                            }
                        };
                        ret.parent = ret;
                        return ret
                    }
                };
                return node
            }
        }, {}, "/proc/self/fd")
    },
    createStandardStreams(input, output, error) {
        if (input) {
            FS.createDevice("/dev", "stdin", input)
        } else {
            FS.symlink("/dev/tty", "/dev/stdin")
        }
        if (output) {
            FS.createDevice("/dev", "stdout", null, output)
        } else {
            FS.symlink("/dev/tty", "/dev/stdout")
        }
        if (error) {
            FS.createDevice("/dev", "stderr", null, error)
        } else {
            FS.symlink("/dev/tty1", "/dev/stderr")
        }
        const stdin = FS.open("/dev/stdin", 0);
        const stdout = FS.open("/dev/stdout", 1);
        const stderr = FS.open("/dev/stderr", 1)
    },
    staticInit() {
        [44].forEach(code => {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = "<generic error, no stack>"
        });
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = {
            MEMFS: MEMFS
        }
    },
    init(input, output, error) {
        FS.initialized = true;
        input ??= Module["stdin"];
        output ??= Module["stdout"];
        error ??= Module["stderr"];
        FS.createStandardStreams(input, output, error)
    },
    quit() {
        FS.initialized = false;
        for (const i = 0; i < FS.streams.length; i++) {
            const stream = FS.streams[i];
            if (!stream) {
                continue
            }
            FS.close(stream)
        }
    },
    findObject(path, dontResolveLastLink) {
        const ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
            return null
        }
        return ret.object
    },
    analyzePath(path, dontResolveLastLink) {
        try {
            const lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            path = lookup.path
        } catch (e) {}
        const ret = {
            isRoot: false,
            exists: false,
            error: 0,
            name: null,
            path: null,
            object: null,
            parentExists: false,
            parentPath: null,
            parentObject: null
        };
        try {
            const lookup = FS.lookupPath(path, {
                parent: true
            });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, {
                follow: !dontResolveLastLink
            });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === "/"
        } catch (e) {
            ret.error = e.errno
        }
        return ret
    },
    createPath(parent, path, canRead, canWrite) {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        const parts = path.split("/").reverse();
        while (parts.length) {
            const part = parts.pop();
            if (!part) continue;
            const current = PATH.join2(parent, part);
            try {
                FS.mkdir(current)
            } catch (e) {}
            parent = current
        }
        return current
    },
    createFile(parent, name, properties, canRead, canWrite) {
        const path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
        const mode = FS_getMode(canRead, canWrite);
        return FS.create(path, mode)
    },
    createDataFile(parent, name, data, canRead, canWrite, canOwn) {
        const path = name;
        if (parent) {
            parent = typeof parent == "string" ? parent : FS.getPath(parent);
            path = name ? PATH.join2(parent, name) : parent
        }
        const mode = FS_getMode(canRead, canWrite);
        const node = FS.create(path, mode);
        if (data) {
            if (typeof data == "string") {
                const arr = new Array(data.length);
                for (const i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
                data = arr
            }
            FS.chmod(node, mode | 146);
            const stream = FS.open(node, 577);
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode)
        }
    },
    createDevice(parent, name, input, output) {
        const path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
        const mode = FS_getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        const dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
            open(stream) {
                stream.seekable = false
            },
            close(stream) {
                if (output?.buffer?.length) {
                    output(10)
                }
            },
            read(stream, buffer, offset, length, pos) {
                const bytesRead = 0;
                for (const i = 0; i < length; i++) {
                    const result;
                    try {
                        result = input()
                    } catch (e) {
                        throw new FS.ErrnoError(29)
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6)
                    }
                    if (result === null || result === undefined) break;
                    bytesRead++;
                    buffer[offset + i] = result
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now()
                }
                return bytesRead
            },
            write(stream, buffer, offset, length, pos) {
                for (const i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i])
                    } catch (e) {
                        throw new FS.ErrnoError(29)
                    }
                }
                if (length) {
                    stream.node.timestamp = Date.now()
                }
                return i
            }
        });
        return FS.mkdev(path, mode, dev)
    },
    forceLoadFile(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != "undefined") {
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")
        } else {
            try {
                obj.contents = readBinary(obj.url);
                obj.usedBytes = obj.contents.length
            } catch (e) {
                throw new FS.ErrnoError(29)
            }
        }
    },
    createLazyFile(parent, name, url, canRead, canWrite) {
        class LazyUint8Array {
            constructor() {
                this.lengthKnown = false;
                this.chunks = []
            }
            get(idx) {
                if (idx > this.length - 1 || idx < 0) {
                    return undefined
                }
                const chunkOffset = idx % this.chunkSize;
                const chunkNum = idx / this.chunkSize | 0;
                return this.getter(chunkNum)[chunkOffset]
            }
            setDataGetter(getter) {
                this.getter = getter
            }
            cacheLength() {
                const xhr = new XMLHttpRequest;
                xhr.open("HEAD", url, false);
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                const datalength = Number(xhr.getResponseHeader("Content-length"));
                const header;
                const hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
                const usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
                const chunkSize = 1024 * 1024;
                if (!hasByteServing) chunkSize = datalength;
                const doXHR = (from, to) => {
                    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
                    const xhr = new XMLHttpRequest;
                    xhr.open("GET", url, false);
                    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                    xhr.responseType = "arraybuffer";
                    if (xhr.overrideMimeType) {
                        xhr.overrideMimeType("text/plain; charset=x-user-defined")
                    }
                    xhr.send(null);
                    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                    if (xhr.response !== undefined) {
                        return new Uint8Array(xhr.response || [])
                    }
                    return intArrayFromString(xhr.responseText || "", true)
                };
                const lazyArray = this;
                lazyArray.setDataGetter(chunkNum => {
                    const start = chunkNum * chunkSize;
                    const end = (chunkNum + 1) * chunkSize - 1;
                    end = Math.min(end, datalength - 1);
                    if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                        lazyArray.chunks[chunkNum] = doXHR(start, end)
                    }
                    if (typeof lazyArray.chunks[chunkNum] == "undefined") throw new Error("doXHR failed!");
                    return lazyArray.chunks[chunkNum]
                });
                if (usesGzip || !datalength) {
                    chunkSize = datalength = 1;
                    datalength = this.getter(0).length;
                    chunkSize = datalength;
                    out("LazyFiles on gzip forces download of the whole file when length is accessed")
                }
                this._length = datalength;
                this._chunkSize = chunkSize;
                this.lengthKnown = true
            }
            get length() {
                if (!this.lengthKnown) {
                    this.cacheLength()
                }
                return this._length
            }
            get chunkSize() {
                if (!this.lengthKnown) {
                    this.cacheLength()
                }
                return this._chunkSize
            }
        }
        if (typeof XMLHttpRequest != "undefined") {
            if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            const lazyArray = new LazyUint8Array;
            const properties = {
                isDevice: false,
                contents: lazyArray
            }
        } else {
            const properties = {
                isDevice: false,
                url: url
            }
        }
        const node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
            node.contents = properties.contents
        } else if (properties.url) {
            node.contents = null;
            node.url = properties.url
        }
        Object.defineProperties(node, {
            usedBytes: {
                get: function() {
                    return this.contents.length
                }
            }
        });
        const stream_ops = {};
        const keys = Object.keys(node.stream_ops);
        keys.forEach(key => {
            const fn = node.stream_ops[key];
            stream_ops[key] = (...args) => {
                FS.forceLoadFile(node);
                return fn(...args)
            }
        });

        function writeChunks(stream, buffer, offset, length, position) {
            const contents = stream.node.contents;
            if (position >= contents.length) return 0;
            const size = Math.min(contents.length - position, length);
            if (contents.slice) {
                for (const i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i]
                }
            } else {
                for (const i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i)
                }
            }
            return size
        }
        stream_ops.read = (stream, buffer, offset, length, position) => {
            FS.forceLoadFile(node);
            return writeChunks(stream, buffer, offset, length, position)
        };
        stream_ops.mmap = (stream, length, position, prot, flags) => {
            FS.forceLoadFile(node);
            const ptr = mmapAlloc(length);
            if (!ptr) {
                throw new FS.ErrnoError(48)
            }
            writeChunks(stream, HEAP8, ptr, length, position);
            return {
                ptr: ptr,
                allocated: true
            }
        };
        node.stream_ops = stream_ops;
        return node
    }
};
const SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    calculateAt(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
            return path
        }
        const dir;
        if (dirfd === -100) {
            dir = FS.cwd()
        } else {
            const dirstream = SYSCALLS.getStreamFromFD(dirfd);
            dir = dirstream.path
        }
        if (path.length == 0) {
            if (!allowEmpty) {
                throw new FS.ErrnoError(44)
            }
            return dir
        }
        return PATH.join2(dir, path)
    },
    doStat(func, path, buf) {
        const stat = func(path);
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[buf + 4 >> 2] = stat.mode;
        HEAPU32[buf + 8 >> 2] = stat.nlink;
        HEAP32[buf + 12 >> 2] = stat.uid;
        HEAP32[buf + 16 >> 2] = stat.gid;
        HEAP32[buf + 20 >> 2] = stat.rdev;
        tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 24 >> 2] = tempI64[0], HEAP32[buf + 28 >> 2] = tempI64[1];
        HEAP32[buf + 32 >> 2] = 4096;
        HEAP32[buf + 36 >> 2] = stat.blocks;
        const atime = stat.atime.getTime();
        const mtime = stat.mtime.getTime();
        const ctime = stat.ctime.getTime();
        tempI64 = [Math.floor(atime / 1e3) >>> 0, (tempDouble = Math.floor(atime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
        HEAPU32[buf + 48 >> 2] = atime % 1e3 * 1e3;
        tempI64 = [Math.floor(mtime / 1e3) >>> 0, (tempDouble = Math.floor(mtime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 56 >> 2] = tempI64[0], HEAP32[buf + 60 >> 2] = tempI64[1];
        HEAPU32[buf + 64 >> 2] = mtime % 1e3 * 1e3;
        tempI64 = [Math.floor(ctime / 1e3) >>> 0, (tempDouble = Math.floor(ctime / 1e3), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 72 >> 2] = tempI64[0], HEAP32[buf + 76 >> 2] = tempI64[1];
        HEAPU32[buf + 80 >> 2] = ctime % 1e3 * 1e3;
        tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 88 >> 2] = tempI64[0], HEAP32[buf + 92 >> 2] = tempI64[1];
        return 0
    },
    doMsync(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43)
        }
        if (flags & 2) {
            return 0
        }
        const buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags)
    },
    getStreamFromFD(fd) {
        const stream = FS.getStreamChecked(fd);
        return stream
    },
    constargs: undefined,
    getStr(ptr) {
        const ret = UTF8ToString(ptr);
        return ret
    }
};

function ___syscall_faccessat(dirfd, path, amode, flags) {
    try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (amode & ~7) {
            return -28
        }
        const lookup = FS.lookupPath(path, {
            follow: true
        });
        const node = lookup.node;
        if (!node) {
            return -44
        }
        const perms = "";
        if (amode & 4) perms += "r";
        if (amode & 2) perms += "w";
        if (amode & 1) perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
            return -2
        }
        return 0
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno
    }
}

function syscallGetconstargI() {
    const ret = HEAP32[+SYSCALLS.constargs >> 2];
    SYSCALLS.constargs += 4;
    return ret
}
const syscallGetconstargP = syscallGetconstargI;

function ___syscall_fcntl64(fd, cmd, constargs) {
    SYSCALLS.constargs = constargs;
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
            case 0: {
                const arg = syscallGetconstargI();
                if (arg < 0) {
                    return -28
                }
                while (FS.streams[arg]) {
                    arg++
                }
                const newStream;
                newStream = FS.dupStream(stream, arg);
                return newStream.fd
            }
            case 1:
            case 2:
                return 0;
            case 3:
                return stream.flags;
            case 4: {
                const arg = syscallGetconstargI();
                stream.flags |= arg;
                return 0
            }
            case 12: {
                const arg = syscallGetconstargP();
                const offset = 0;
                HEAP16[arg + offset >> 1] = 2;
                return 0
            }
            case 13:
            case 14:
                return 0
        }
        return -28
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno
    }
}
const stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);

function ___syscall_getcwd(buf, size) {
    try {
        if (size === 0) return -28;
        const cwd = FS.cwd();
        const cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
        if (size < cwdLengthInBytes) return -68;
        stringToUTF8(cwd, buf, size);
        return cwdLengthInBytes
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno
    }
}

function ___syscall_ioctl(fd, op, constargs) {
    SYSCALLS.constargs = constargs;
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
            case 21509: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21505: {
                if (!stream.tty) return -59;
                if (stream.tty.ops.ioctl_tcgets) {
                    const termios = stream.tty.ops.ioctl_tcgets(stream);
                    const argp = syscallGetconstargP();
                    HEAP32[argp >> 2] = termios.c_iflag || 0;
                    HEAP32[argp + 4 >> 2] = termios.c_oflag || 0;
                    HEAP32[argp + 8 >> 2] = termios.c_cflag || 0;
                    HEAP32[argp + 12 >> 2] = termios.c_lflag || 0;
                    for (const i = 0; i < 32; i++) {
                        HEAP8[argp + i + 17] = termios.c_cc[i] || 0
                    }
                    return 0
                }
                return 0
            }
            case 21510:
            case 21511:
            case 21512: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21506:
            case 21507:
            case 21508: {
                if (!stream.tty) return -59;
                if (stream.tty.ops.ioctl_tcsets) {
                    const argp = syscallGetconstargP();
                    const c_iflag = HEAP32[argp >> 2];
                    const c_oflag = HEAP32[argp + 4 >> 2];
                    const c_cflag = HEAP32[argp + 8 >> 2];
                    const c_lflag = HEAP32[argp + 12 >> 2];
                    const c_cc = [];
                    for (const i = 0; i < 32; i++) {
                        c_cc.push(HEAP8[argp + i + 17])
                    }
                    return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
                        c_iflag: c_iflag,
                        c_oflag: c_oflag,
                        c_cflag: c_cflag,
                        c_lflag: c_lflag,
                        c_cc: c_cc
                    })
                }
                return 0
            }
            case 21519: {
                if (!stream.tty) return -59;
                const argp = syscallGetconstargP();
                HEAP32[argp >> 2] = 0;
                return 0
            }
            case 21520: {
                if (!stream.tty) return -59;
                return -28
            }
            case 21531: {
                const argp = syscallGetconstargP();
                return FS.ioctl(stream, op, argp)
            }
            case 21523: {
                if (!stream.tty) return -59;
                if (stream.tty.ops.ioctl_tiocgwinsz) {
                    const winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
                    const argp = syscallGetconstargP();
                    HEAP16[argp >> 1] = winsize[0];
                    HEAP16[argp + 2 >> 1] = winsize[1]
                }
                return 0
            }
            case 21524: {
                if (!stream.tty) return -59;
                return 0
            }
            case 21515: {
                if (!stream.tty) return -59;
                return 0
            }
            default:
                return -28
        }
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno
    }
}

function ___syscall_openat(dirfd, path, flags, constargs) {
    SYSCALLS.constargs = constargs;
    try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        const mode = constargs ? syscallGetconstargI() : 0;
        return FS.open(path, flags, mode).fd
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return -e.errno
    }
}
const nowIsMonotonic = 1;
const __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
const __emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);
const readEmAsmArgsArray = [];
const readEmAsmArgs = (sigPtr, buf) => {
    readEmAsmArgsArray.length = 0;
    const ch;
    while (ch = HEAPU8[sigPtr++]) {
        const wide = ch != 105;
        wide &= ch != 112;
        buf += wide && buf % 8 ? 4 : 0;
        readEmAsmArgsArray.push(ch == 112 ? HEAPU32[buf >> 2] : ch == 105 ? HEAP32[buf >> 2] : HEAPF64[buf >> 3]);
        buf += wide ? 8 : 4
    }
    return readEmAsmArgsArray
};
const runEmAsmFunction = (code, sigPtr, argbuf) => {
    const args = readEmAsmArgs(sigPtr, argbuf);
    return ASM_CONSTS[code](...args)
};
const _emscripten_asm_const_int = (code, sigPtr, argbuf) => runEmAsmFunction(code, sigPtr, argbuf);
const _emscripten_date_now = () => Date.now();
const JSEvents = {
    removeAllEventListeners() {
        while (JSEvents.eventHandlers.length) {
            JSEvents._removeHandler(JSEvents.eventHandlers.length - 1)
        }
        JSEvents.deferredCalls = []
    },
    inEventHandler: 0,
    deferredCalls: [],
    deferCall(targetFunction, precedence, argsList) {
        function arraysHaveEqualContent(arrA, arrB) {
            if (arrA.length != arrB.length) return false;
            for (const i in arrA) {
                if (arrA[i] != arrB[i]) return false
            }
            return true
        }
        for (const call of JSEvents.deferredCalls) {
            if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
                return
            }
        }
        JSEvents.deferredCalls.push({
            targetFunction: targetFunction,
            precedence: precedence,
            argsList: argsList
        });
        JSEvents.deferredCalls.sort((x, y) => x.precedence < y.precedence)
    },
    removeDeferredCalls(targetFunction) {
        JSEvents.deferredCalls = JSEvents.deferredCalls.filter(call => call.targetFunction != targetFunction)
    },
    canPerformEventHandlerRequests() {
        if (navigator.userActivation) {
            return navigator.userActivation.isActive
        }
        return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls
    },
    runDeferredCalls() {
        if (!JSEvents.canPerformEventHandlerRequests()) {
            return
        }
        const deferredCalls = JSEvents.deferredCalls;
        JSEvents.deferredCalls = [];
        for (const call of deferredCalls) {
            call.targetFunction(...call.argsList)
        }
    },
    eventHandlers: [],
    removeAllHandlersOnTarget: (target, eventTypeString) => {
        for (const i = 0; i < JSEvents.eventHandlers.length; ++i) {
            if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
                JSEvents._removeHandler(i--)
            }
        }
    },
    _removeHandler(i) {
        const h = JSEvents.eventHandlers[i];
        h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
        JSEvents.eventHandlers.splice(i, 1)
    },
    registerOrRemoveHandler(eventHandler) {
        if (!eventHandler.target) {
            return -4
        }
        if (eventHandler.callbackfunc) {
            eventHandler.eventListenerFunc = function(event) {
                ++JSEvents.inEventHandler;
                JSEvents.currentEventHandler = eventHandler;
                JSEvents.runDeferredCalls();
                eventHandler.handlerFunc(event);
                JSEvents.runDeferredCalls();
                --JSEvents.inEventHandler
            };
            eventHandler.target.addEventListener(eventHandler.eventTypeString, eventHandler.eventListenerFunc, eventHandler.useCapture);
            JSEvents.eventHandlers.push(eventHandler)
        } else {
            for (const i = 0; i < JSEvents.eventHandlers.length; ++i) {
                if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
                    JSEvents._removeHandler(i--)
                }
            }
        }
        return 0
    },
    getNodeNameForTarget(target) {
        if (!target) return "";
        if (target == window) return "#window";
        if (target == screen) return "#screen";
        return target?.nodeName || ""
    },
    fullscreenEnabled() {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled
    }
};
const maybeCStringToJsString = cString => cString > 2 ? UTF8ToString(cString) : cString;
const specialHTMLTargets = [0, typeof document != "undefined" ? document : 0, typeof window != "undefined" ? window : 0];
const findEventTarget = target => {
    target = maybeCStringToJsString(target);
    const domElement = specialHTMLTargets[target] || (typeof document != "undefined" ? document.querySelector(target) : undefined);
    return domElement
};
const getBoundingClientRect = e => specialHTMLTargets.indexOf(e) < 0 ? e.getBoundingClientRect() : {
    left: 0,
    top: 0
};
const _emscripten_get_element_css_size = (target, width, height) => {
    target = findEventTarget(target);
    if (!target) return -4;
    const rect = getBoundingClientRect(target);
    HEAPF64[width >> 3] = rect.width;
    HEAPF64[height >> 3] = rect.height;
    return 0
};
const fillGamepadEventData = (eventStruct, e) => {
    HEAPF64[eventStruct >> 3] = e.timestamp;
    for (const i = 0; i < e.axes.length; ++i) {
        HEAPF64[eventStruct + i * 8 + 16 >> 3] = e.axes[i]
    }
    for (const i = 0; i < e.buttons.length; ++i) {
        if (typeof e.buttons[i] == "object") {
            HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i].value
        } else {
            HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i]
        }
    }
    for (const i = 0; i < e.buttons.length; ++i) {
        if (typeof e.buttons[i] == "object") {
            HEAP8[eventStruct + i + 1040] = e.buttons[i].pressed
        } else {
            HEAP8[eventStruct + i + 1040] = e.buttons[i] == 1
        }
    }
    HEAP8[eventStruct + 1104] = e.connected;
    HEAP32[eventStruct + 1108 >> 2] = e.index;
    HEAP32[eventStruct + 8 >> 2] = e.axes.length;
    HEAP32[eventStruct + 12 >> 2] = e.buttons.length;
    stringToUTF8(e.id, eventStruct + 1112, 64);
    stringToUTF8(e.mapping, eventStruct + 1176, 64)
};
const _emscripten_get_gamepad_status = (index, gamepadState) => {
    if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
    if (!JSEvents.lastGamepadState[index]) return -7;
    fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
    return 0
};
const _emscripten_get_now;
_emscripten_get_now = () => performance.now();
const _emscripten_get_num_gamepads = () => JSEvents.lastGamepadState.length;
const abortOnCannotGrowMemory = requestedSize => {
    abort("OOM")
};
const _emscripten_resize_heap = requestedSize => {
    const oldSize = HEAPU8.length;
    requestedSize >>>= 0;
    abortOnCannotGrowMemory(requestedSize)
};
const _emscripten_sample_gamepad_data = () => {
    try {
        if (navigator.getGamepads) return (JSEvents.lastGamepadState = navigator.getGamepads()) ? 0 : -1
    } catch (e) {
        navigator.getGamepads = null
    }
    return -1
};
const findCanvasEventTarget = findEventTarget;
const _emscripten_set_canvas_element_size = (target, width, height) => {
    const canvas = findCanvasEventTarget(target);
    if (!canvas) return -4;
    canvas.width = width;
    canvas.height = height;
    return 0
};
const fillMouseEventData = (eventStruct, e, target) => {
    HEAPF64[eventStruct >> 3] = e.timeStamp;
    const idx = eventStruct >> 2;
    HEAP32[idx + 2] = e.screenX;
    HEAP32[idx + 3] = e.screenY;
    HEAP32[idx + 4] = e.clientX;
    HEAP32[idx + 5] = e.clientY;
    HEAP8[eventStruct + 24] = e.ctrlKey;
    HEAP8[eventStruct + 25] = e.shiftKey;
    HEAP8[eventStruct + 26] = e.altKey;
    HEAP8[eventStruct + 27] = e.metaKey;
    HEAP16[idx * 2 + 14] = e.button;
    HEAP16[idx * 2 + 15] = e.buttons;
    HEAP32[idx + 8] = e["movementX"];
    HEAP32[idx + 9] = e["movementY"];
    const rect = getBoundingClientRect(target);
    HEAP32[idx + 10] = e.clientX - (rect.left | 0);
    HEAP32[idx + 11] = e.clientY - (rect.top | 0)
};
const wasmTable;
const getWasmTableEntry = funcPtr => wasmTable.get(funcPtr);
const registerMouseEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
    if (!JSEvents.mouseEvent) JSEvents.mouseEvent = _malloc(64);
    target = findEventTarget(target);
    const mouseEventHandlerFunc = (e = event) => {
        fillMouseEventData(JSEvents.mouseEvent, e, target);
        if (getWasmTableEntry(callbackfunc)(eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault()
    };
    const eventHandler = {
        target: target,
        allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: mouseEventHandlerFunc,
        useCapture: useCapture
    };
    return JSEvents.registerOrRemoveHandler(eventHandler)
};
const _emscripten_set_click_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 4, "click", targetThread);
const fillFullscreenChangeEventData = eventStruct => {
    const fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    const isFullscreen = !!fullscreenElement;
    HEAP8[eventStruct] = isFullscreen;
    HEAP8[eventStruct + 1] = JSEvents.fullscreenEnabled();
    const reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
    const nodeName = JSEvents.getNodeNameForTarget(reportedElement);
    const id = reportedElement?.id || "";
    stringToUTF8(nodeName, eventStruct + 2, 128);
    stringToUTF8(id, eventStruct + 130, 128);
    HEAP32[eventStruct + 260 >> 2] = reportedElement ? reportedElement.clientWidth : 0;
    HEAP32[eventStruct + 264 >> 2] = reportedElement ? reportedElement.clientHeight : 0;
    HEAP32[eventStruct + 268 >> 2] = screen.width;
    HEAP32[eventStruct + 272 >> 2] = screen.height;
    if (isFullscreen) {
        JSEvents.previousFullscreenElement = fullscreenElement
    }
};
const registerFullscreenChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
    if (!JSEvents.fullscreenChangeEvent) JSEvents.fullscreenChangeEvent = _malloc(276);
    const fullscreenChangeEventhandlerFunc = (e = event) => {
        const fullscreenChangeEvent = JSEvents.fullscreenChangeEvent;
        fillFullscreenChangeEventData(fullscreenChangeEvent);
        if (getWasmTableEntry(callbackfunc)(eventTypeId, fullscreenChangeEvent, userData)) e.preventDefault()
    };
    const eventHandler = {
        target: target,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: fullscreenChangeEventhandlerFunc,
        useCapture: useCapture
    };
    return JSEvents.registerOrRemoveHandler(eventHandler)
};
const _emscripten_set_fullscreenchange_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => {
    if (!JSEvents.fullscreenEnabled()) return -1;
    target = findEventTarget(target);
    if (!target) return -4;
    registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange", targetThread);
    return registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange", targetThread)
};
const registerGamepadEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
    if (!JSEvents.gamepadEvent) JSEvents.gamepadEvent = _malloc(1240);
    const gamepadEventHandlerFunc = (e = event) => {
        const gamepadEvent = JSEvents.gamepadEvent;
        fillGamepadEventData(gamepadEvent, e["gamepad"]);
        if (getWasmTableEntry(callbackfunc)(eventTypeId, gamepadEvent, userData)) e.preventDefault()
    };
    const eventHandler = {
        target: findEventTarget(target),
        allowsDeferredCalls: true,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: gamepadEventHandlerFunc,
        useCapture: useCapture
    };
    return JSEvents.registerOrRemoveHandler(eventHandler)
};
const _emscripten_set_gamepadconnected_callback_on_thread = (userData, useCapture, callbackfunc, targetThread) => {
    if (_emscripten_sample_gamepad_data()) return -1;
    return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 26, "gamepadconnected", targetThread)
};
const _emscripten_set_gamepaddisconnected_callback_on_thread = (userData, useCapture, callbackfunc, targetThread) => {
    if (_emscripten_sample_gamepad_data()) return -1;
    return registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 27, "gamepaddisconnected", targetThread)
};
const handleException = e => {
    if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS
    }
    quit_(1, e)
};
const runtimeKeepaliveCounter = 0;
const keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
const _proc_exit = code => {
    EXITSTATUS = code;
    if (!keepRuntimeAlive()) {
        Module["onExit"]?.(code);
        ABORT = true
    }
    quit_(code, new ExitStatus(code))
};
const exitJS = (status, implicit) => {
    EXITSTATUS = status;
    _proc_exit(status)
};
const _exit = exitJS;
const maybeExit = () => {
    if (!keepRuntimeAlive()) {
        try {
            _exit(EXITSTATUS)
        } catch (e) {
            handleException(e)
        }
    }
};
const callUserCallback = func => {
    if (ABORT) {
        return
    }
    try {
        func();
        maybeExit()
    } catch (e) {
        handleException(e)
    }
};
const safeSetTimeout = (func, timeout) => setTimeout(() => {
    callUserCallback(func)
}, timeout);
const warnOnce = text => {
    warnOnce.shown ||= {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        if (ENVIRONMENT_IS_NODE) text = "warning: " + text;
        err(text)
    }
};
const Browser = {
    mainLoop: {
        running: false,
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause() {
            Browser.mainLoop.scheduler = null;
            Browser.mainLoop.currentlyRunningMainloop++
        },
        resume() {
            Browser.mainLoop.currentlyRunningMainloop++;
            const timingMode = Browser.mainLoop.timingMode;
            const timingValue = Browser.mainLoop.timingValue;
            const func = Browser.mainLoop.func;
            Browser.mainLoop.func = null;
            setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
            _emscripten_set_main_loop_timing(timingMode, timingValue);
            Browser.mainLoop.scheduler()
        },
        updateStatus() {
            if (Module["setStatus"]) {
                const message = Module["statusMessage"] || "Please wait...";
                const remaining = Browser.mainLoop.remainingBlockers;
                const expected = Browser.mainLoop.expectedBlockers;
                if (remaining) {
                    if (remaining < expected) {
                        Module["setStatus"](`{message} ({expected - remaining}/{expected})`)
                    } else {
                        Module["setStatus"](message)
                    }
                } else {
                    Module["setStatus"]("")
                }
            }
        },
        runIter(func) {
            if (ABORT) return;
            if (Module["preMainLoop"]) {
                const preRet = Module["preMainLoop"]();
                if (preRet === false) {
                    return
                }
            }
            callUserCallback(func);
            Module["postMainLoop"]?.()
        }
    },
    useWebGL: false,
    isFullscreen: false,
    pointerLock: false,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init() {
        if (Browser.initted) return;
        Browser.initted = true;
        const imagePlugin = {};
        imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
            return !Module["noImageDecoding"] && /\.(jpg|jpeg|png|bmp|webp)$/i.test(name)
        };
        imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
            const b = new Blob([byteArray], {
                type: Browser.getMimetype(name)
            });
            if (b.size !== byteArray.length) {
                b = new Blob([new Uint8Array(byteArray).buffer], {
                    type: Browser.getMimetype(name)
                })
            }
            const url = URL.createObjectURL(b);
            const img = new Image;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                preloadedImages[name] = canvas;
                URL.revokeObjectURL(url);
                onload?.(byteArray)
            };
            img.onerror = event => {
                err(`Image ${url} could not be decoded`);
                onerror?.()
            };
            img.src = url
        };
        preloadPlugins.push(imagePlugin);
        const audioPlugin = {};
        audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
            return !Module["noAudioDecoding"] && name.substr(-4) in {
                ".ogg": 1,
                ".wav": 1,
                ".mp3": 1
            }
        };
        audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
            const done = false;

            function finish(audio) {
                if (done) return;
                done = true;
                preloadedAudios[name] = audio;
                onload?.(byteArray)
            }
            const b = new Blob([byteArray], {
                type: Browser.getMimetype(name)
            });
            const url = URL.createObjectURL(b);
            const audio = new Audio;
            audio.addEventListener("canplaythrough", () => finish(audio), false);
            audio.onerror = function audio_onerror(event) {
                if (done) return;
                err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`);

                function encode64(data) {
                    const BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                    const PAD = "=";
                    const ret = "";
                    const leftchar = 0;
                    const leftbits = 0;
                    for (const i = 0; i < data.length; i++) {
                        leftchar = leftchar << 8 | data[i];
                        leftbits += 8;
                        while (leftbits >= 6) {
                            const curr = leftchar >> leftbits - 6 & 63;
                            leftbits -= 6;
                            ret += BASE[curr]
                        }
                    }
                    if (leftbits == 2) {
                        ret += BASE[(leftchar & 3) << 4];
                        ret += PAD + PAD
                    } else if (leftbits == 4) {
                        ret += BASE[(leftchar & 15) << 2];
                        ret += PAD
                    }
                    return ret
                }
                audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
                finish(audio)
            };
            audio.src = url;
            safeSetTimeout(() => {
                finish(audio)
            }, 1e4)
        };
        preloadPlugins.push(audioPlugin);

        function pointerLockChange() {
            Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"]
        }
        const canvas = Module["canvas"];
        if (canvas) {
            canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || (() => {});
            canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || (() => {});
            canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
            document.addEventListener("pointerlockchange", pointerLockChange, false);
            document.addEventListener("mozpointerlockchange", pointerLockChange, false);
            document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
            document.addEventListener("mspointerlockchange", pointerLockChange, false);
            if (Module["elementPointerLock"]) {
                canvas.addEventListener("click", ev => {
                    if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
                        Module["canvas"].requestPointerLock();
                        ev.preventDefault()
                    }
                }, false)
            }
        }
    },
    createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
        const ctx;
        const contextHandle;
        if (useWebGL) {
            const contextAttributes = {
                antialias: false,
                alpha: false,
                majorVersion: 1
            };
            if (webGLContextAttributes) {
                for (const attribute in webGLContextAttributes) {
                    contextAttributes[attribute] = webGLContextAttributes[attribute]
                }
            }
            if (typeof GL != "undefined") {
                contextHandle = GL.createContext(canvas, contextAttributes);
                if (contextHandle) {
                    ctx = GL.getContext(contextHandle).GLctx
                }
            }
        } else {
            ctx = canvas.getContext("2d")
        }
        if (!ctx) return null;
        if (setInModule) {
            Module.ctx = ctx;
            if (useWebGL) GL.makeContextCurrent(contextHandle);
            Browser.useWebGL = useWebGL;
            Browser.moduleContextCreatedCallbacks.forEach(callback => callback());
            Browser.init()
        }
        return ctx
    },
    fullscreenHandlersInstalled: false,
    lockPointer: undefined,
    resizeCanvas: undefined,
    requestFullscreen(lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas == "undefined") Browser.resizeCanvas = false;
        const canvas = Module["canvas"];

        function fullscreenChange() {
            Browser.isFullscreen = false;
            const canvasContainer = canvas.parentNode;
            if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                canvas.exitFullscreen = Browser.exitFullscreen;
                if (Browser.lockPointer) canvas.requestPointerLock();
                Browser.isFullscreen = true;
                if (Browser.resizeCanvas) {
                    Browser.setFullscreenCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas)
                }
            } else {
                canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                canvasContainer.parentNode.removeChild(canvasContainer);
                if (Browser.resizeCanvas) {
                    Browser.setWindowedCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas)
                }
            }
            Module["onFullScreen"]?.(Browser.isFullscreen);
            Module["onFullscreen"]?.(Browser.isFullscreen)
        }
        if (!Browser.fullscreenHandlersInstalled) {
            Browser.fullscreenHandlersInstalled = true;
            document.addEventListener("fullscreenchange", fullscreenChange, false);
            document.addEventListener("mozfullscreenchange", fullscreenChange, false);
            document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
            document.addEventListener("MSFullscreenChange", fullscreenChange, false)
        }
        const canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? () => canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null) || (canvasContainer["webkitRequestFullScreen"] ? () => canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null);
        canvasContainer.requestFullscreen()
    },
    exitFullscreen() {
        if (!Browser.isFullscreen) {
            return false
        }
        const CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || (() => {});
        CFS.apply(document, []);
        return true
    },
    nextRAF: 0,
    fakeRequestAnimationFrame(func) {
        const now = Date.now();
        if (Browser.nextRAF === 0) {
            Browser.nextRAF = now + 1e3 / 60
        } else {
            while (now + 2 >= Browser.nextRAF) {
                Browser.nextRAF += 1e3 / 60
            }
        }
        const delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay)
    },
    requestAnimationFrame(func) {
        if (typeof requestAnimationFrame == "function") {
            requestAnimationFrame(func);
            return
        }
        const RAF = Browser.fakeRequestAnimationFrame;
        RAF(func)
    },
    safeSetTimeout(func, timeout) {
        return safeSetTimeout(func, timeout)
    },
    safeRequestAnimationFrame(func) {
        return Browser.requestAnimationFrame(() => {
            callUserCallback(func)
        })
    },
    getMimetype(name) {
        return {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            bmp: "image/bmp",
            ogg: "audio/ogg",
            wav: "audio/wav",
            mp3: "audio/mpeg"
        } [name.substr(name.lastIndexOf(".") + 1)]
    },
    getUserMedia(func) {
        window.getUserMedia ||= navigator["getUserMedia"] || navigator["mozGetUserMedia"];
        window.getUserMedia(func)
    },
    getMovementX(event) {
        return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0
    },
    getMovementY(event) {
        return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0
    },
    getMouseWheelDelta(event) {
        const delta = 0;
        switch (event.type) {
            case "DOMMouseScroll":
                delta = event.detail / 3;
                break;
            case "mousewheel":
                delta = event.wheelDelta / 120;
                break;
            case "wheel":
                delta = event.deltaY;
                switch (event.deltaMode) {
                    case 0:
                        delta /= 100;
                        break;
                    case 1:
                        delta /= 3;
                        break;
                    case 2:
                        delta *= 80;
                        break;
                    default:
                        throw "unrecognized mouse wheel delta mode: " + event.deltaMode
                }
                break;
            default:
                throw "unrecognized mouse wheel event: " + event.type
        }
        return delta
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseCoords(pageX, pageY) {
        const rect = Module["canvas"].getBoundingClientRect();
        const cw = Module["canvas"].width;
        const ch = Module["canvas"].height;
        const scrollX = typeof window.scrollX != "undefined" ? window.scrollX : window.pageXOffset;
        const scrollY = typeof window.scrollY != "undefined" ? window.scrollY : window.pageYOffset;
        const adjustedX = pageX - (scrollX + rect.left);
        const adjustedY = pageY - (scrollY + rect.top);
        adjustedX = adjustedX * (cw / rect.width);
        adjustedY = adjustedY * (ch / rect.height);
        return {
            x: adjustedX,
            y: adjustedY
        }
    },
    setMouseCoords(pageX, pageY) {
        const {
            x: x,
            y: y
        } = Browser.calculateMouseCoords(pageX, pageY);
        Browser.mouseMovementX = x - Browser.mouseX;
        Browser.mouseMovementY = y - Browser.mouseY;
        Browser.mouseX = x;
        Browser.mouseY = y
    },
    calculateMouseEvent(event) {
        if (Browser.pointerLock) {
            if (event.type != "mousemove" && "mozMovementX" in event) {
                Browser.mouseMovementX = Browser.mouseMovementY = 0
            } else {
                Browser.mouseMovementX = Browser.getMovementX(event);
                Browser.mouseMovementY = Browser.getMovementY(event)
            }
            Browser.mouseX += Browser.mouseMovementX;
            Browser.mouseY += Browser.mouseMovementY
        } else {
            if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
                const touch = event.touch;
                if (touch === undefined) {
                    return
                }
                const coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
                if (event.type === "touchstart") {
                    Browser.lastTouches[touch.identifier] = coords;
                    Browser.touches[touch.identifier] = coords
                } else if (event.type === "touchend" || event.type === "touchmove") {
                    const last = Browser.touches[touch.identifier];
                    last ||= coords;
                    Browser.lastTouches[touch.identifier] = last;
                    Browser.touches[touch.identifier] = coords
                }
                return
            }
            Browser.setMouseCoords(event.pageX, event.pageY)
        }
    },
    resizeListeners: [],
    updateResizeListeners() {
        const canvas = Module["canvas"];
        Browser.resizeListeners.forEach(listener => listener(canvas.width, canvas.height))
    },
    setCanvasSize(width, height, noUpdates) {
        const canvas = Module["canvas"];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners()
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize() {
        if (typeof SDL != "undefined") {
            const flags = HEAPU32[SDL.screen >> 2];
            flags = flags | 8388608;
            HEAP32[SDL.screen >> 2] = flags
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners()
    },
    setWindowedCanvasSize() {
        if (typeof SDL != "undefined") {
            const flags = HEAPU32[SDL.screen >> 2];
            flags = flags & ~8388608;
            HEAP32[SDL.screen >> 2] = flags
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners()
    },
    updateCanvasDimensions(canvas, wNative, hNative) {
        if (wNative && hNative) {
            canvas.widthNative = wNative;
            canvas.heightNative = hNative
        } else {
            wNative = canvas.widthNative;
            hNative = canvas.heightNative
        }
        const w = wNative;
        const h = hNative;
        if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
            if (w / h < Module["forcedAspectRatio"]) {
                w = Math.round(h * Module["forcedAspectRatio"])
            } else {
                h = Math.round(w / Module["forcedAspectRatio"])
            }
        }
        if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
            const factor = Math.min(screen.width / w, screen.height / h);
            w = Math.round(w * factor);
            h = Math.round(h * factor)
        }
        if (Browser.resizeCanvas) {
            if (canvas.width != w) canvas.width = w;
            if (canvas.height != h) canvas.height = h;
            if (typeof canvas.style != "undefined") {
                canvas.style.removeProperty("width");
                canvas.style.removeProperty("height")
            }
        } else {
            if (canvas.width != wNative) canvas.width = wNative;
            if (canvas.height != hNative) canvas.height = hNative;
            if (typeof canvas.style != "undefined") {
                if (w != wNative || h != hNative) {
                    canvas.style.setProperty("width", w + "px", "important");
                    canvas.style.setProperty("height", h + "px", "important")
                } else {
                    canvas.style.removeProperty("width");
                    canvas.style.removeProperty("height")
                }
            }
        }
    }
};
const _emscripten_set_main_loop_timing = (mode, value) => {
    Browser.mainLoop.timingMode = mode;
    Browser.mainLoop.timingValue = value;
    if (!Browser.mainLoop.func) {
        return 1
    }
    if (!Browser.mainLoop.running) {
        Browser.mainLoop.running = true
    }
    if (mode == 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
            const timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
            setTimeout(Browser.mainLoop.runner, timeUntilNextTick)
        };
        Browser.mainLoop.method = "timeout"
    } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
            Browser.requestAnimationFrame(Browser.mainLoop.runner)
        };
        Browser.mainLoop.method = "rAF"
    } else if (mode == 2) {
        if (typeof Browser.setImmediate == "undefined") {
            if (typeof setImmediate == "undefined") {
                const setImmediates = [];
                const emscriptenMainLoopMessageId = "setimmediate";
                const Browser_setImmediate_messageHandler = event => {
                    if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                        event.stopPropagation();
                        setImmediates.shift()()
                    }
                };
                addEventListener("message", Browser_setImmediate_messageHandler, true);
                Browser.setImmediate = function Browser_emulated_setImmediate(func) {
                    setImmediates.push(func);
                    if (ENVIRONMENT_IS_WORKER) {
                        Module["setImmediates"] ??= [];
                        Module["setImmediates"].push(func);
                        postMessage({
                            target: emscriptenMainLoopMessageId
                        })
                    } else postMessage(emscriptenMainLoopMessageId, "*")
                }
            } else {
                Browser.setImmediate = setImmediate
            }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
            Browser.setImmediate(Browser.mainLoop.runner)
        };
        Browser.mainLoop.method = "immediate"
    }
    return 0
};
const setMainLoop = (browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) => {
    Browser.mainLoop.func = browserIterationFunc;
    Browser.mainLoop.arg = arg;
    const thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;

    function checkIsRunning() {
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
            return false
        }
        return true
    }
    Browser.mainLoop.running = false;
    Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
            const start = Date.now();
            const blocker = Browser.mainLoop.queue.shift();
            blocker.func(blocker.arg);
            if (Browser.mainLoop.remainingBlockers) {
                const remaining = Browser.mainLoop.remainingBlockers;
                const next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                if (blocker.counted) {
                    Browser.mainLoop.remainingBlockers = next
                } else {
                    next = next + .5;
                    Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9
                }
            }
            Browser.mainLoop.updateStatus();
            if (!checkIsRunning()) return;
            setTimeout(Browser.mainLoop.runner, 0);
            return
        }
        if (!checkIsRunning()) return;
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
            Browser.mainLoop.scheduler();
            return
        } else if (Browser.mainLoop.timingMode == 0) {
            Browser.mainLoop.tickStartTime = _emscripten_get_now()
        }
        Browser.mainLoop.runIter(browserIterationFunc);
        if (!checkIsRunning()) return;
        if (typeof SDL == "object") SDL.audio?.queueNewAudioData?.();
        Browser.mainLoop.scheduler()
    };
    if (!noSetTiming) {
        if (fps && fps > 0) {
            _emscripten_set_main_loop_timing(0, 1e3 / fps)
        } else {
            _emscripten_set_main_loop_timing(1, 1)
        }
        Browser.mainLoop.scheduler()
    }
    if (simulateInfiniteLoop) {
        throw "unwind"
    }
};
const _emscripten_set_main_loop = (func, fps, simulateInfiniteLoop) => {
    const browserIterationFunc = getWasmTableEntry(func);
    setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop)
};
const _emscripten_set_mousemove_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);
const fillPointerlockChangeEventData = eventStruct => {
    const pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
    const isPointerlocked = !!pointerLockElement;
    HEAP8[eventStruct] = isPointerlocked;
    const nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
    const id = pointerLockElement?.id || "";
    stringToUTF8(nodeName, eventStruct + 1, 128);
    stringToUTF8(id, eventStruct + 129, 128)
};
const registerPointerlockChangeEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
    if (!JSEvents.pointerlockChangeEvent) JSEvents.pointerlockChangeEvent = _malloc(257);
    const pointerlockChangeEventHandlerFunc = (e = event) => {
        const pointerlockChangeEvent = JSEvents.pointerlockChangeEvent;
        fillPointerlockChangeEventData(pointerlockChangeEvent);
        if (getWasmTableEntry(callbackfunc)(eventTypeId, pointerlockChangeEvent, userData)) e.preventDefault()
    };
    const eventHandler = {
        target: target,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: pointerlockChangeEventHandlerFunc,
        useCapture: useCapture
    };
    return JSEvents.registerOrRemoveHandler(eventHandler)
};
const _emscripten_set_pointerlockchange_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => {
    if (!document || !document.body || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
        return -1
    }
    target = findEventTarget(target);
    if (!target) return -4;
    registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mozpointerlockchange", targetThread);
    registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "webkitpointerlockchange", targetThread);
    registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mspointerlockchange", targetThread);
    return registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange", targetThread)
};
const registerUiEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
    if (!JSEvents.uiEvent) JSEvents.uiEvent = _malloc(36);
    target = findEventTarget(target);
    const uiEventHandlerFunc = (e = event) => {
        if (e.target != target) {
            return
        }
        const b = document.body;
        if (!b) {
            return
        }
        const uiEvent = JSEvents.uiEvent;
        HEAP32[uiEvent >> 2] = 0;
        HEAP32[uiEvent + 4 >> 2] = b.clientWidth;
        HEAP32[uiEvent + 8 >> 2] = b.clientHeight;
        HEAP32[uiEvent + 12 >> 2] = innerWidth;
        HEAP32[uiEvent + 16 >> 2] = innerHeight;
        HEAP32[uiEvent + 20 >> 2] = outerWidth;
        HEAP32[uiEvent + 24 >> 2] = outerHeight;
        HEAP32[uiEvent + 28 >> 2] = pageXOffset | 0;
        HEAP32[uiEvent + 32 >> 2] = pageYOffset | 0;
        if (getWasmTableEntry(callbackfunc)(eventTypeId, uiEvent, userData)) e.preventDefault()
    };
    const eventHandler = {
        target: target,
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: uiEventHandlerFunc,
        useCapture: useCapture
    };
    return JSEvents.registerOrRemoveHandler(eventHandler)
};
const _emscripten_set_resize_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize", targetThread);
const registerTouchEventCallback = (target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) => {
    if (!JSEvents.touchEvent) JSEvents.touchEvent = _malloc(1552);
    target = findEventTarget(target);
    const touchEventHandlerFunc = e => {
        const t, touches = {},
            et = e.touches;
        for (let t of et) {
            t.isChanged = t.onTarget = 0;
            touches[t.identifier] = t
        }
        for (let t of e.changedTouches) {
            t.isChanged = 1;
            touches[t.identifier] = t
        }
        for (let t of e.targetTouches) {
            touches[t.identifier].onTarget = 1
        }
        const touchEvent = JSEvents.touchEvent;
        HEAPF64[touchEvent >> 3] = e.timeStamp;
        HEAP8[touchEvent + 12] = e.ctrlKey;
        HEAP8[touchEvent + 13] = e.shiftKey;
        HEAP8[touchEvent + 14] = e.altKey;
        HEAP8[touchEvent + 15] = e.metaKey;
        const idx = touchEvent + 16;
        const targetRect = getBoundingClientRect(target);
        const numTouches = 0;
        for (let t of Object.values(touches)) {
            const idx32 = idx >> 2;
            HEAP32[idx32 + 0] = t.identifier;
            HEAP32[idx32 + 1] = t.screenX;
            HEAP32[idx32 + 2] = t.screenY;
            HEAP32[idx32 + 3] = t.clientX;
            HEAP32[idx32 + 4] = t.clientY;
            HEAP32[idx32 + 5] = t.pageX;
            HEAP32[idx32 + 6] = t.pageY;
            HEAP8[idx + 28] = t.isChanged;
            HEAP8[idx + 29] = t.onTarget;
            HEAP32[idx32 + 8] = t.clientX - (targetRect.left | 0);
            HEAP32[idx32 + 9] = t.clientY - (targetRect.top | 0);
            idx += 48;
            if (++numTouches > 31) {
                break
            }
        }
        HEAP32[touchEvent + 8 >> 2] = numTouches;
        if (getWasmTableEntry(callbackfunc)(eventTypeId, touchEvent, userData)) e.preventDefault()
    };
    const eventHandler = {
        target: target,
        allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend",
        eventTypeString: eventTypeString,
        callbackfunc: callbackfunc,
        handlerFunc: touchEventHandlerFunc,
        useCapture: useCapture
    };
    return JSEvents.registerOrRemoveHandler(eventHandler)
};
const _emscripten_set_touchcancel_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel", targetThread);
const _emscripten_set_touchend_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend", targetThread);
const _emscripten_set_touchmove_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove", targetThread);
const _emscripten_set_touchstart_callback_on_thread = (target, userData, useCapture, callbackfunc, targetThread) => registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart", targetThread);
const _emscripten_set_window_title = title => document.title = UTF8ToString(title);

function _fd_close(fd) {
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno
    }
}
const doReadv = (stream, iov, iovcnt, offset) => {
    const ret = 0;
    for (const i = 0; i < iovcnt; i++) {
        const ptr = HEAPU32[iov >> 2];
        const len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        const curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break;
        if (typeof offset != "undefined") {
            offset += curr
        }
    }
    return ret
};

function _fd_read(fd, iov, iovcnt, pnum) {
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        const num = doReadv(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno
    }
}
const convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;

function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    const offset = convertI32PairToI53Checked(offset_low, offset_high);
    try {
        if (isNaN(offset)) return 61;
        const stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
        return 0
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno
    }
}
const doWritev = (stream, iov, iovcnt, offset) => {
    const ret = 0;
    for (const i = 0; i < iovcnt; i++) {
        const ptr = HEAPU32[iov >> 2];
        const len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        const curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) {
            break
        }
        if (typeof offset != "undefined") {
            offset += curr
        }
    }
    return ret
};

function _fd_write(fd, iov, iovcnt, pnum) {
    try {
        const stream = SYSCALLS.getStreamFromFD(fd);
        const num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0
    } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
        return e.errno
    }
}
const GLctx;
const webgl_enable_ANGLE_instanced_arrays = ctx => {
    const ext = ctx.getExtension("ANGLE_instanced_arrays");
    if (ext) {
        ctx["vertexAttribDivisor"] = (index, divisor) => ext["vertexAttribDivisorANGLE"](index, divisor);
        ctx["drawArraysInstanced"] = (mode, first, count, primcount) => ext["drawArraysInstancedANGLE"](mode, first, count, primcount);
        ctx["drawElementsInstanced"] = (mode, count, type, indices, primcount) => ext["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
        return 1
    }
};
const webgl_enable_OES_vertex_array_object = ctx => {
    const ext = ctx.getExtension("OES_vertex_array_object");
    if (ext) {
        ctx["createVertexArray"] = () => ext["createVertexArrayOES"]();
        ctx["deleteVertexArray"] = vao => ext["deleteVertexArrayOES"](vao);
        ctx["bindVertexArray"] = vao => ext["bindVertexArrayOES"](vao);
        ctx["isVertexArray"] = vao => ext["isVertexArrayOES"](vao);
        return 1
    }
};
const webgl_enable_WEBGL_draw_buffers = ctx => {
    const ext = ctx.getExtension("WEBGL_draw_buffers");
    if (ext) {
        ctx["drawBuffers"] = (n, bufs) => ext["drawBuffersWEBGL"](n, bufs);
        return 1
    }
};
const webgl_enable_WEBGL_multi_draw = ctx => !!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));
const getEmscriptenSupportedExtensions = ctx => {
    const supportedExtensions = ["ANGLE_instanced_arrays", "EXT_blend_minmax", "EXT_disjoint_timer_query", "EXT_frag_depth", "EXT_shader_texture_lod", "EXT_sRGB", "OES_element_index_uint", "OES_fbo_render_mipmap", "OES_standard_derivatives", "OES_texture_float", "OES_texture_half_float", "OES_texture_half_float_linear", "OES_vertex_array_object", "WEBGL_color_buffer_float", "WEBGL_depth_texture", "WEBGL_draw_buffers", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw"];
    return (ctx.getSupportedExtensions() || []).filter(ext => supportedExtensions.includes(ext))
};
const GL = {
    counter: 1,
    buffers: [],
    programs: [],
    framebuffers: [],
    renderbuffers: [],
    textures: [],
    shaders: [],
    vaos: [],
    contexts: [],
    offscreenCanvases: {},
    queries: [],
    stringCache: {},
    unpackAlignment: 4,
    unpackRowLength: 0,
    recordError: errorCode => {
        if (!GL.lastError) {
            GL.lastError = errorCode
        }
    },
    getNewId: table => {
        const ret = GL.counter++;
        for (const i = table.length; i < ret; i++) {
            table[i] = null
        }
        return ret
    },
    genObject: (n, buffers, createFunction, objectTable) => {
        for (const i = 0; i < n; i++) {
            const buffer = GLctx[createFunction]();
            const id = buffer && GL.getNewId(objectTable);
            if (buffer) {
                buffer.name = id;
                objectTable[id] = buffer
            } else {
                GL.recordError(1282)
            }
            HEAP32[buffers + i * 4 >> 2] = id
        }
    },
    getSource: (shader, count, string, length) => {
        const source = "";
        for (const i = 0; i < count; ++i) {
            const len = length ? HEAPU32[length + i * 4 >> 2] : undefined;
            source += UTF8ToString(HEAPU32[string + i * 4 >> 2], len)
        }
        return source
    },
    createContext: (canvas, webGLContextAttributes) => {
        if (!canvas.getContextSafariWebGL2Fixed) {
            canvas.getContextSafariWebGL2Fixed = canvas.getContext;

            function fixedGetContext(ver, attrs) {
                const gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
                return ver == "webgl" == gl instanceof WebGLRenderingContext ? gl : null
            }
            canvas.getContext = fixedGetContext
        }
        const ctx = canvas.getContext("webgl", webGLContextAttributes);
        if (!ctx) return 0;
        const handle = GL.registerContext(ctx, webGLContextAttributes);
        return handle
    },
    registerContext: (ctx, webGLContextAttributes) => {
        const handle = GL.getNewId(GL.contexts);
        const context = {
            handle: handle,
            attributes: webGLContextAttributes,
            version: webGLContextAttributes.majorVersion,
            GLctx: ctx
        };
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
            GL.initExtensions(context)
        }
        return handle
    },
    makeContextCurrent: contextHandle => {
        GL.currentContext = GL.contexts[contextHandle];
        Module.ctx = GLctx = GL.currentContext?.GLctx;
        return !(contextHandle && !GLctx)
    },
    getContext: contextHandle => GL.contexts[contextHandle],
    deleteContext: contextHandle => {
        if (GL.currentContext === GL.contexts[contextHandle]) {
            GL.currentContext = null
        }
        if (typeof JSEvents == "object") {
            JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas)
        }
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) {
            GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined
        }
        GL.contexts[contextHandle] = null
    },
    initExtensions: context => {
        context ||= GL.currentContext;
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
        const GLctx = context.GLctx;
        webgl_enable_ANGLE_instanced_arrays(GLctx);
        webgl_enable_OES_vertex_array_object(GLctx);
        webgl_enable_WEBGL_draw_buffers(GLctx);
        {
            GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query")
        }
        webgl_enable_WEBGL_multi_draw(GLctx);
        getEmscriptenSupportedExtensions(GLctx).forEach(ext => {
            if (!ext.includes("lose_context") && !ext.includes("debug")) {
                GLctx.getExtension(ext)
            }
        })
    }
};
const _glActiveTexture = x0 => GLctx.activeTexture(x0);
const _glAttachShader = (program, shader) => {
    GLctx.attachShader(GL.programs[program], GL.shaders[shader])
};
const _glBindAttribLocation = (program, index, name) => {
    GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name))
};
const _glBindBuffer = (target, buffer) => {
    GLctx.bindBuffer(target, GL.buffers[buffer])
};
const _glBindTexture = (target, texture) => {
    GLctx.bindTexture(target, GL.textures[texture])
};
const _glBindVertexArray = vao => {
    GLctx.bindVertexArray(GL.vaos[vao])
};
const _glBlendFunc = (x0, x1) => GLctx.blendFunc(x0, x1);
const _glBufferData = (target, size, data, usage) => {
    GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage)
};
const _glBufferSubData = (target, offset, size, data) => {
    GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size))
};
const _glClear = x0 => GLctx.clear(x0);
const _glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);
const _glClearDepthf = x0 => GLctx.clearDepth(x0);
const _glCompileShader = shader => {
    GLctx.compileShader(GL.shaders[shader])
};
const _glCompressedTexImage2D = (target, level, internalFormat, width, height, border, imageSize, data) => {
    GLctx.compressedTexImage2D(target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null)
};
const _glCreateProgram = () => {
    const id = GL.getNewId(GL.programs);
    const program = GLctx.createProgram();
    program.name = id;
    program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
    program.uniformIdCounter = 1;
    GL.programs[id] = program;
    return id
};
const _glCreateShader = shaderType => {
    const id = GL.getNewId(GL.shaders);
    GL.shaders[id] = GLctx.createShader(shaderType);
    return id
};
const _glCullFace = x0 => GLctx.cullFace(x0);
const _glDeleteBuffers = (n, buffers) => {
    for (const i = 0; i < n; i++) {
        const id = HEAP32[buffers + i * 4 >> 2];
        const buffer = GL.buffers[id];
        if (!buffer) continue;
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null
    }
};
const _glDeleteProgram = id => {
    if (!id) return;
    const program = GL.programs[id];
    if (!program) {
        GL.recordError(1281);
        return
    }
    GLctx.deleteProgram(program);
    program.name = 0;
    GL.programs[id] = null
};
const _glDeleteShader = id => {
    if (!id) return;
    const shader = GL.shaders[id];
    if (!shader) {
        GL.recordError(1281);
        return
    }
    GLctx.deleteShader(shader);
    GL.shaders[id] = null
};
const _glDeleteTextures = (n, textures) => {
    for (const i = 0; i < n; i++) {
        const id = HEAP32[textures + i * 4 >> 2];
        const texture = GL.textures[id];
        if (!texture) continue;
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null
    }
};
const _glDeleteVertexArrays = (n, vaos) => {
    for (const i = 0; i < n; i++) {
        const id = HEAP32[vaos + i * 4 >> 2];
        GLctx.deleteVertexArray(GL.vaos[id]);
        GL.vaos[id] = null
    }
};
const _glDepthFunc = x0 => GLctx.depthFunc(x0);
const _glDetachShader = (program, shader) => {
    GLctx.detachShader(GL.programs[program], GL.shaders[shader])
};
const _glDisable = x0 => GLctx.disable(x0);
const _glDisableVertexAttribArray = index => {
    GLctx.disableVertexAttribArray(index)
};
const _glDrawArrays = (mode, first, count) => {
    GLctx.drawArrays(mode, first, count)
};
const _glDrawElements = (mode, count, type, indices) => {
    GLctx.drawElements(mode, count, type, indices)
};
const _glEnable = x0 => GLctx.enable(x0);
const _glEnableVertexAttribArray = index => {
    GLctx.enableVertexAttribArray(index)
};
const _glFrontFace = x0 => GLctx.frontFace(x0);
const _glGenBuffers = (n, buffers) => {
    GL.genObject(n, buffers, "createBuffer", GL.buffers)
};
const _glGenTextures = (n, textures) => {
    GL.genObject(n, textures, "createTexture", GL.textures)
};
const _glGenVertexArrays = (n, arrays) => {
    GL.genObject(n, arrays, "createVertexArray", GL.vaos)
};
const _glGetAttribLocation = (program, name) => GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
const writeI53ToI64 = (ptr, num) => {
    HEAPU32[ptr >> 2] = num;
    const lower = HEAPU32[ptr >> 2];
    HEAPU32[ptr + 4 >> 2] = (num - lower) / 4294967296
};
const emscriptenWebGLGet = (name_, p, type) => {
    if (!p) {
        GL.recordError(1281);
        return
    }
    const ret = undefined;
    switch (name_) {
        case 36346:
            ret = 1;
            break;
        case 36344:
            if (type != 0 && type != 1) {
                GL.recordError(1280)
            }
            return;
        case 36345:
            ret = 0;
            break;
        case 34466:
            const formats = GLctx.getParameter(34467);
            ret = formats ? formats.length : 0;
            break
    }
    if (ret === undefined) {
        const result = GLctx.getParameter(name_);
        switch (typeof result) {
            case "number":
                ret = result;
                break;
            case "boolean":
                ret = result ? 1 : 0;
                break;
            case "string":
                GL.recordError(1280);
                return;
            case "object":
                if (result === null) {
                    switch (name_) {
                        case 34964:
                        case 35725:
                        case 34965:
                        case 36006:
                        case 36007:
                        case 32873:
                        case 34229:
                        case 34068: {
                            ret = 0;
                            break
                        }
                        default: {
                            GL.recordError(1280);
                            return
                        }
                    }
                } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
                    for (const i = 0; i < result.length; ++i) {
                        switch (type) {
                            case 0:
                                HEAP32[p + i * 4 >> 2] = result[i];
                                break;
                            case 2:
                                HEAPF32[p + i * 4 >> 2] = result[i];
                                break;
                            case 4:
                                HEAP8[p + i] = result[i] ? 1 : 0;
                                break
                        }
                    }
                    return
                } else {
                    try {
                        ret = result.name | 0
                    } catch (e) {
                        GL.recordError(1280);
                        err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
                        return
                    }
                }
                break;
            default:
                GL.recordError(1280);
                err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof result}!`);
                return
        }
    }
    switch (type) {
        case 1:
            writeI53ToI64(p, ret);
            break;
        case 0:
            HEAP32[p >> 2] = ret;
            break;
        case 2:
            HEAPF32[p >> 2] = ret;
            break;
        case 4:
            HEAP8[p] = ret ? 1 : 0;
            break
    }
};
const _glGetFloatv = (name_, p) => emscriptenWebGLGet(name_, p, 2);
const _glGetProgramInfoLog = (program, maxLength, length, infoLog) => {
    const log = GLctx.getProgramInfoLog(GL.programs[program]);
    if (log === null) log = "(unknown error)";
    const numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
    if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
};
const _glGetProgramiv = (program, pname, p) => {
    if (!p) {
        GL.recordError(1281);
        return
    }
    if (program >= GL.counter) {
        GL.recordError(1281);
        return
    }
    program = GL.programs[program];
    if (pname == 35716) {
        const log = GLctx.getProgramInfoLog(program);
        if (log === null) log = "(unknown error)";
        HEAP32[p >> 2] = log.length + 1
    } else if (pname == 35719) {
        if (!program.maxUniformLength) {
            for (const i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
                program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1)
            }
        }
        HEAP32[p >> 2] = program.maxUniformLength
    } else if (pname == 35722) {
        if (!program.maxAttributeLength) {
            for (const i = 0; i < GLctx.getProgramParameter(program, 35721); ++i) {
                program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1)
            }
        }
        HEAP32[p >> 2] = program.maxAttributeLength
    } else if (pname == 35381) {
        if (!program.maxUniformBlockNameLength) {
            for (const i = 0; i < GLctx.getProgramParameter(program, 35382); ++i) {
                program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1)
            }
        }
        HEAP32[p >> 2] = program.maxUniformBlockNameLength
    } else {
        HEAP32[p >> 2] = GLctx.getProgramParameter(program, pname)
    }
};
const _glGetShaderInfoLog = (shader, maxLength, length, infoLog) => {
    const log = GLctx.getShaderInfoLog(GL.shaders[shader]);
    if (log === null) log = "(unknown error)";
    const numBytesWrittenExclNull = maxLength > 0 && infoLog ? stringToUTF8(log, infoLog, maxLength) : 0;
    if (length) HEAP32[length >> 2] = numBytesWrittenExclNull
};
const _glGetShaderiv = (shader, pname, p) => {
    if (!p) {
        GL.recordError(1281);
        return
    }
    if (pname == 35716) {
        const log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = "(unknown error)";
        const logLength = log ? log.length + 1 : 0;
        HEAP32[p >> 2] = logLength
    } else if (pname == 35720) {
        const source = GLctx.getShaderSource(GL.shaders[shader]);
        const sourceLength = source ? source.length + 1 : 0;
        HEAP32[p >> 2] = sourceLength
    } else {
        HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname)
    }
};
const stringToNewUTF8 = str => {
    const size = lengthBytesUTF8(str) + 1;
    const ret = _malloc(size);
    if (ret) stringToUTF8(str, ret, size);
    return ret
};
const webglGetExtensions = function $webglGetExtensions() {
    const exts = getEmscriptenSupportedExtensions(GLctx);
    exts = exts.concat(exts.map(e => "GL_" + e));
    return exts
};
const _glGetString = name_ => {
    const ret = GL.stringCache[name_];
    if (!ret) {
        switch (name_) {
            case 7939:
                ret = stringToNewUTF8(webglGetExtensions().join(" "));
                break;
            case 7936:
            case 7937:
            case 37445:
            case 37446:
                const s = GLctx.getParameter(name_);
                if (!s) {
                    GL.recordError(1280)
                }
                ret = s ? stringToNewUTF8(s) : 0;
                break;
            case 7938:
                const webGLVersion = GLctx.getParameter(7938);
                const glVersion = `OpenGL ES 2.0 (${webGLVersion})`;
                ret = stringToNewUTF8(glVersion);
                break;
            case 35724:
                const glslVersion = GLctx.getParameter(35724);
                const ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
                const ver_num = glslVersion.match(ver_re);
                if (ver_num !== null) {
                    if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
                    glslVersion = `OpenGL ES GLSL ES ${ver_num[1]} (${glslVersion})`
                }
                ret = stringToNewUTF8(glslVersion);
                break;
            default:
                GL.recordError(1280)
        }
        GL.stringCache[name_] = ret
    }
    return ret
};
const jstoi_q = str => parseInt(str);
const webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");
const webglPrepareUniformLocationsBeforeFirstUse = program => {
    const uniformLocsById = program.uniformLocsById,
        uniformSizeAndIdsByName = program.uniformSizeAndIdsByName,
        i, j;
    if (!uniformLocsById) {
        program.uniformLocsById = uniformLocsById = {};
        program.uniformArrayNamesById = {};
        for (i = 0; i < GLctx.getProgramParameter(program, 35718); ++i) {
            const u = GLctx.getActiveUniform(program, i);
            const nm = u.name;
            const sz = u.size;
            const lb = webglGetLeftBracePos(nm);
            const arrayName = lb > 0 ? nm.slice(0, lb) : nm;
            const id = program.uniformIdCounter;
            program.uniformIdCounter += sz;
            uniformSizeAndIdsByName[arrayName] = [sz, id];
            for (j = 0; j < sz; ++j) {
                uniformLocsById[id] = j;
                program.uniformArrayNamesById[id++] = arrayName
            }
        }
    }
};
const _glGetUniformLocation = (program, name) => {
    name = UTF8ToString(name);
    if (program = GL.programs[program]) {
        webglPrepareUniformLocationsBeforeFirstUse(program);
        const uniformLocsById = program.uniformLocsById;
        const arrayIndex = 0;
        const uniformBaseName = name;
        const leftBrace = webglGetLeftBracePos(name);
        if (leftBrace > 0) {
            arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
            uniformBaseName = name.slice(0, leftBrace)
        }
        const sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
        if (sizeAndId && arrayIndex < sizeAndId[0]) {
            arrayIndex += sizeAndId[1];
            if (uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name)) {
                return arrayIndex
            }
        }
    } else {
        GL.recordError(1281)
    }
    return -1
};
const _glLinkProgram = program => {
    program = GL.programs[program];
    GLctx.linkProgram(program);
    program.uniformLocsById = 0;
    program.uniformSizeAndIdsByName = {}
};
const _glPixelStorei = (pname, param) => {
    if (pname == 3317) {
        GL.unpackAlignment = param
    } else if (pname == 3314) {
        GL.unpackRowLength = param
    }
    GLctx.pixelStorei(pname, param)
};
const computeUnpackAlignedImageSize = (width, height, sizePerPixel) => {
    function roundedToNextMultipleOf(x, y) {
        return x + y - 1 & -y
    }
    const plainRowSize = (GL.unpackRowLength || width) * sizePerPixel;
    const alignedRowSize = roundedToNextMultipleOf(plainRowSize, GL.unpackAlignment);
    return height * alignedRowSize
};
const colorChannelsInGlTextureFormat = format => {
    const colorChannels = {
        5: 3,
        6: 4,
        8: 2,
        29502: 3,
        29504: 4
    };
    return colorChannels[format - 6402] || 1
};
const heapObjectForWebGLType = type => {
    type -= 5120;
    if (type == 1) return HEAPU8;
    if (type == 4) return HEAP32;
    if (type == 6) return HEAPF32;
    if (type == 5 || type == 28922) return HEAPU32;
    return HEAPU16
};
const toTypedArrayIndex = (pointer, heap) => pointer >>> 31 - Math.clz32(heap.BYTES_PER_ELEMENT);
const emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels, internalFormat) => {
    const heap = heapObjectForWebGLType(type);
    const sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
    const bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel);
    return heap.subarray(toTypedArrayIndex(pixels, heap), toTypedArrayIndex(pixels + bytes, heap))
};
const _glReadPixels = (x, y, width, height, format, type, pixels) => {
    const pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
    if (!pixelData) {
        GL.recordError(1280);
        return
    }
    GLctx.readPixels(x, y, width, height, format, type, pixelData)
};
const _glShaderSource = (shader, count, string, length) => {
    const source = GL.getSource(shader, count, string, length);
    GLctx.shaderSource(GL.shaders[shader], source)
};
const _glTexImage2D = (target, level, internalFormat, width, height, border, format, type, pixels) => {
    const pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null;
    GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData)
};
const _glTexParameterf = (x0, x1, x2) => GLctx.texParameterf(x0, x1, x2);
const _glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);
const webglGetUniformLocation = location => {
    const p = GLctx.currentProgram;
    if (p) {
        const webglLoc = p.uniformLocsById[location];
        if (typeof webglLoc == "number") {
            p.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(p, p.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ""))
        }
        return webglLoc
    } else {
        GL.recordError(1282)
    }
};
const _glUniform1i = (location, v0) => {
    GLctx.uniform1i(webglGetUniformLocation(location), v0)
};
const _glUniform4f = (location, v0, v1, v2, v3) => {
    GLctx.uniform4f(webglGetUniformLocation(location), v0, v1, v2, v3)
};
const miniTempWebGLFloatBuffers = [];
const _glUniformMatrix4fv = (location, count, transpose, value) => {
    if (count <= 18) {
        const view = miniTempWebGLFloatBuffers[16 * count];
        const heap = HEAPF32;
        value = value >> 2;
        for (const i = 0; i < 16 * count; i += 16) {
            const dst = value + i;
            view[i] = heap[dst];
            view[i + 1] = heap[dst + 1];
            view[i + 2] = heap[dst + 2];
            view[i + 3] = heap[dst + 3];
            view[i + 4] = heap[dst + 4];
            view[i + 5] = heap[dst + 5];
            view[i + 6] = heap[dst + 6];
            view[i + 7] = heap[dst + 7];
            view[i + 8] = heap[dst + 8];
            view[i + 9] = heap[dst + 9];
            view[i + 10] = heap[dst + 10];
            view[i + 11] = heap[dst + 11];
            view[i + 12] = heap[dst + 12];
            view[i + 13] = heap[dst + 13];
            view[i + 14] = heap[dst + 14];
            view[i + 15] = heap[dst + 15]
        }
    } else {
        const view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2)
    }
    GLctx.uniformMatrix4fv(webglGetUniformLocation(location), !!transpose, view)
};
const _glUseProgram = program => {
    program = GL.programs[program];
    GLctx.useProgram(program);
    GLctx.currentProgram = program
};
const _glVertexAttribPointer = (index, size, type, normalized, stride, ptr) => {
    GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr)
};
const _glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);

function GLFW_Window(id, width, height, framebufferWidth, framebufferHeight, title, monitor, share) {
    this.id = id;
    this.x = 0;
    this.y = 0;
    this.fullscreen = false;
    this.storedX = 0;
    this.storedY = 0;
    this.width = width;
    this.height = height;
    this.framebufferWidth = framebufferWidth;
    this.framebufferHeight = framebufferHeight;
    this.storedWidth = width;
    this.storedHeight = height;
    this.title = title;
    this.monitor = monitor;
    this.share = share;
    this.attributes = Object.assign({}, GLFW.hints);
    this.inputModes = {
        208897: 212993,
        208898: 0,
        208899: 0
    };
    this.buttons = 0;
    this.keys = new Array;
    this.domKeys = new Array;
    this.shouldClose = 0;
    this.title = null;
    this.windowPosFunc = 0;
    this.windowSizeFunc = 0;
    this.windowCloseFunc = 0;
    this.windowRefreshFunc = 0;
    this.windowFocusFunc = 0;
    this.windowIconifyFunc = 0;
    this.windowMaximizeFunc = 0;
    this.framebufferSizeFunc = 0;
    this.windowContentScaleFunc = 0;
    this.mouseButtonFunc = 0;
    this.cursorPosFunc = 0;
    this.cursorEnterFunc = 0;
    this.scrollFunc = 0;
    this.dropFunc = 0;
    this.keyFunc = 0;
    this.charFunc = 0;
    this.userptr = 0
}
const GLFW = {
    WindowFromId: id => {
        if (id <= 0 || !GLFW.windows) return null;
        return GLFW.windows[id - 1]
    },
    joystickFunc: 0,
    errorFunc: 0,
    monitorFunc: 0,
    active: null,
    scale: null,
    windows: null,
    monitors: null,
    monitorString: null,
    versionString: null,
    initialTime: null,
    extensions: null,
    devicePixelRatioMQL: null,
    hints: null,
    primaryTouchId: null,
    defaultHints: {
        131073: 0,
        131074: 0,
        131075: 1,
        131076: 1,
        131077: 1,
        131082: 0,
        135169: 8,
        135170: 8,
        135171: 8,
        135172: 8,
        135173: 24,
        135174: 8,
        135175: 0,
        135176: 0,
        135177: 0,
        135178: 0,
        135179: 0,
        135180: 0,
        135181: 0,
        135182: 0,
        135183: 0,
        139265: 196609,
        139266: 1,
        139267: 0,
        139268: 0,
        139269: 0,
        139270: 0,
        139271: 0,
        139272: 0,
        139276: 0
    },
    DOMToGLFWKeyCode: keycode => {
        switch (keycode) {
            case 32:
                return 32;
            case 222:
                return 39;
            case 188:
                return 44;
            case 173:
                return 45;
            case 189:
                return 45;
            case 190:
                return 46;
            case 191:
                return 47;
            case 48:
                return 48;
            case 49:
                return 49;
            case 50:
                return 50;
            case 51:
                return 51;
            case 52:
                return 52;
            case 53:
                return 53;
            case 54:
                return 54;
            case 55:
                return 55;
            case 56:
                return 56;
            case 57:
                return 57;
            case 59:
                return 59;
            case 61:
                return 61;
            case 187:
                return 61;
            case 65:
                return 65;
            case 66:
                return 66;
            case 67:
                return 67;
            case 68:
                return 68;
            case 69:
                return 69;
            case 70:
                return 70;
            case 71:
                return 71;
            case 72:
                return 72;
            case 73:
                return 73;
            case 74:
                return 74;
            case 75:
                return 75;
            case 76:
                return 76;
            case 77:
                return 77;
            case 78:
                return 78;
            case 79:
                return 79;
            case 80:
                return 80;
            case 81:
                return 81;
            case 82:
                return 82;
            case 83:
                return 83;
            case 84:
                return 84;
            case 85:
                return 85;
            case 86:
                return 86;
            case 87:
                return 87;
            case 88:
                return 88;
            case 89:
                return 89;
            case 90:
                return 90;
            case 219:
                return 91;
            case 220:
                return 92;
            case 221:
                return 93;
            case 192:
                return 96;
            case 27:
                return 256;
            case 13:
                return 257;
            case 9:
                return 258;
            case 8:
                return 259;
            case 45:
                return 260;
            case 46:
                return 261;
            case 39:
                return 262;
            case 37:
                return 263;
            case 40:
                return 264;
            case 38:
                return 265;
            case 33:
                return 266;
            case 34:
                return 267;
            case 36:
                return 268;
            case 35:
                return 269;
            case 20:
                return 280;
            case 145:
                return 281;
            case 144:
                return 282;
            case 44:
                return 283;
            case 19:
                return 284;
            case 112:
                return 290;
            case 113:
                return 291;
            case 114:
                return 292;
            case 115:
                return 293;
            case 116:
                return 294;
            case 117:
                return 295;
            case 118:
                return 296;
            case 119:
                return 297;
            case 120:
                return 298;
            case 121:
                return 299;
            case 122:
                return 300;
            case 123:
                return 301;
            case 124:
                return 302;
            case 125:
                return 303;
            case 126:
                return 304;
            case 127:
                return 305;
            case 128:
                return 306;
            case 129:
                return 307;
            case 130:
                return 308;
            case 131:
                return 309;
            case 132:
                return 310;
            case 133:
                return 311;
            case 134:
                return 312;
            case 135:
                return 313;
            case 136:
                return 314;
            case 96:
                return 320;
            case 97:
                return 321;
            case 98:
                return 322;
            case 99:
                return 323;
            case 100:
                return 324;
            case 101:
                return 325;
            case 102:
                return 326;
            case 103:
                return 327;
            case 104:
                return 328;
            case 105:
                return 329;
            case 110:
                return 330;
            case 111:
                return 331;
            case 106:
                return 332;
            case 109:
                return 333;
            case 107:
                return 334;
            case 16:
                return 340;
            case 17:
                return 341;
            case 18:
                return 342;
            case 91:
                return 343;
            case 224:
                return 343;
            case 93:
                return 348;
            default:
                return -1
        }
    },
    getModBits: win => {
        const mod = 0;
        if (win.keys[340]) mod |= 1;
        if (win.keys[341]) mod |= 2;
        if (win.keys[342]) mod |= 4;
        if (win.keys[343] || win.keys[348]) mod |= 8;
        return mod
    },
    onKeyPress: event => {
        if (!GLFW.active || !GLFW.active.charFunc) return;
        if (event.ctrlKey || event.metaKey) return;
        const charCode = event.charCode;
        if (charCode == 0 || charCode >= 0 && charCode <= 31) return;
        getWasmTableEntry(GLFW.active.charFunc)(GLFW.active.id, charCode)
    },
    onKeyChanged: (keyCode, status) => {
        if (!GLFW.active) return;
        const key = GLFW.DOMToGLFWKeyCode(keyCode);
        if (key == -1) return;
        const repeat = status && GLFW.active.keys[key];
        GLFW.active.keys[key] = status;
        GLFW.active.domKeys[keyCode] = status;
        if (GLFW.active.keyFunc) {
            if (repeat) status = 2;
            getWasmTableEntry(GLFW.active.keyFunc)(GLFW.active.id, key, keyCode, status, GLFW.getModBits(GLFW.active))
        }
    },
    onGamepadConnected: event => {
        GLFW.refreshJoysticks()
    },
    onGamepadDisconnected: event => {
        GLFW.refreshJoysticks()
    },
    onKeydown: event => {
        GLFW.onKeyChanged(event.keyCode, 1);
        if (event.keyCode === 8 || event.keyCode === 9) {
            event.preventDefault()
        }
    },
    onKeyup: event => {
        GLFW.onKeyChanged(event.keyCode, 0)
    },
    onBlur: event => {
        if (!GLFW.active) return;
        for (const i = 0; i < GLFW.active.domKeys.length; ++i) {
            if (GLFW.active.domKeys[i]) {
                GLFW.onKeyChanged(i, 0)
            }
        }
    },
    onMousemove: event => {
        if (!GLFW.active) return;
        if (event.type === "touchmove") {
            event.preventDefault();
            let primaryChanged = false;
            for (let i of event.changedTouches) {
                if (GLFW.primaryTouchId === i.identifier) {
                    Browser.setMouseCoords(i.pageX, i.pageY);
                    primaryChanged = true;
                    break
                }
            }
            if (!primaryChanged) {
                return
            }
        } else {
            Browser.calculateMouseEvent(event)
        }
        if (event.target != Module["canvas"] || !GLFW.active.cursorPosFunc) return;
        if (GLFW.active.cursorPosFunc) {
            getWasmTableEntry(GLFW.active.cursorPosFunc)(GLFW.active.id, Browser.mouseX, Browser.mouseY)
        }
    },
    DOMToGLFWMouseButton: event => {
        const eventButton = event["button"];
        if (eventButton > 0) {
            if (eventButton == 1) {
                eventButton = 2
            } else {
                eventButton = 1
            }
        }
        return eventButton
    },
    onMouseenter: event => {
        if (!GLFW.active) return;
        if (event.target != Module["canvas"]) return;
        if (GLFW.active.cursorEnterFunc) {
            getWasmTableEntry(GLFW.active.cursorEnterFunc)(GLFW.active.id, 1)
        }
    },
    onMouseleave: event => {
        if (!GLFW.active) return;
        if (event.target != Module["canvas"]) return;
        if (GLFW.active.cursorEnterFunc) {
            getWasmTableEntry(GLFW.active.cursorEnterFunc)(GLFW.active.id, 0)
        }
    },
    onMouseButtonChanged: (event, status) => {
        if (!GLFW.active) return;
        if (event.target != Module["canvas"]) return;
        const isTouchType = event.type === "touchstart" || event.type === "touchend" || event.type === "touchcancel";
        let eventButton = 0;
        if (isTouchType) {
            event.preventDefault();
            let primaryChanged = false;
            if (GLFW.primaryTouchId === null && event.type === "touchstart" && event.targetTouches.length > 0) {
                const chosenTouch = event.targetTouches[0];
                GLFW.primaryTouchId = chosenTouch.identifier;
                Browser.setMouseCoords(chosenTouch.pageX, chosenTouch.pageY);
                primaryChanged = true
            } else if (event.type === "touchend" || event.type === "touchcancel") {
                for (let i of event.changedTouches) {
                    if (GLFW.primaryTouchId === i.identifier) {
                        GLFW.primaryTouchId = null;
                        primaryChanged = true;
                        break
                    }
                }
            }
            if (!primaryChanged) {
                return
            }
        } else {
            Browser.calculateMouseEvent(event);
            eventButton = GLFW.DOMToGLFWMouseButton(event)
        }
        if (status == 1) {
            GLFW.active.buttons |= 1 << eventButton;
            try {
                event.target.setCapture()
            } catch (e) {}
        } else {
            GLFW.active.buttons &= ~(1 << eventButton)
        }
        if (GLFW.active.mouseButtonFunc) {
            getWasmTableEntry(GLFW.active.mouseButtonFunc)(GLFW.active.id, eventButton, status, GLFW.getModBits(GLFW.active))
        }
    },
    onMouseButtonDown: event => {
        if (!GLFW.active) return;
        GLFW.onMouseButtonChanged(event, 1)
    },
    onMouseButtonUp: event => {
        if (!GLFW.active) return;
        GLFW.onMouseButtonChanged(event, 0)
    },
    onMouseWheel: event => {
        const delta = -Browser.getMouseWheelDelta(event);
        delta = delta == 0 ? 0 : delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1);
        GLFW.wheelPos += delta;
        if (!GLFW.active || !GLFW.active.scrollFunc || event.target != Module["canvas"]) return;
        const sx = 0;
        const sy = delta;
        if (event.type == "mousewheel") {
            sx = event.wheelDeltaX
        } else {
            sx = event.deltaX
        }
        getWasmTableEntry(GLFW.active.scrollFunc)(GLFW.active.id, sx, sy);
        event.preventDefault()
    },
    onCanvasResize: (width, height, framebufferWidth, framebufferHeight) => {
        if (!GLFW.active) return;
        const resizeNeeded = false;
        if (document["fullscreen"] || document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
            if (!GLFW.active.fullscreen) {
                resizeNeeded = width != screen.width || height != screen.height;
                GLFW.active.storedX = GLFW.active.x;
                GLFW.active.storedY = GLFW.active.y;
                GLFW.active.storedWidth = GLFW.active.width;
                GLFW.active.storedHeight = GLFW.active.height;
                GLFW.active.x = GLFW.active.y = 0;
                GLFW.active.width = screen.width;
                GLFW.active.height = screen.height;
                GLFW.active.fullscreen = true
            }
        } else if (GLFW.active.fullscreen == true) {
            resizeNeeded = width != GLFW.active.storedWidth || height != GLFW.active.storedHeight;
            GLFW.active.x = GLFW.active.storedX;
            GLFW.active.y = GLFW.active.storedY;
            GLFW.active.width = GLFW.active.storedWidth;
            GLFW.active.height = GLFW.active.storedHeight;
            GLFW.active.fullscreen = false
        }
        if (resizeNeeded) {
            Browser.setCanvasSize(GLFW.active.width, GLFW.active.height)
        } else if (GLFW.active.width != width || GLFW.active.height != height || GLFW.active.framebufferWidth != framebufferWidth || GLFW.active.framebufferHeight != framebufferHeight) {
            GLFW.active.width = width;
            GLFW.active.height = height;
            GLFW.active.framebufferWidth = framebufferWidth;
            GLFW.active.framebufferHeight = framebufferHeight;
            GLFW.onWindowSizeChanged();
            GLFW.onFramebufferSizeChanged()
        }
    },
    onWindowSizeChanged: () => {
        if (!GLFW.active) return;
        if (GLFW.active.windowSizeFunc) {
            getWasmTableEntry(GLFW.active.windowSizeFunc)(GLFW.active.id, GLFW.active.width, GLFW.active.height)
        }
    },
    onFramebufferSizeChanged: () => {
        if (!GLFW.active) return;
        if (GLFW.active.framebufferSizeFunc) {
            getWasmTableEntry(GLFW.active.framebufferSizeFunc)(GLFW.active.id, GLFW.active.framebufferWidth, GLFW.active.framebufferHeight)
        }
    },
    onWindowContentScaleChanged: scale => {
        GLFW.scale = scale;
        if (!GLFW.active) return;
        if (GLFW.active.windowContentScaleFunc) {
            getWasmTableEntry(GLFW.active.windowContentScaleFunc)(GLFW.active.id, GLFW.scale, GLFW.scale)
        }
    },
    getTime: () => _emscripten_get_now() / 1e3,
    setWindowTitle: (winid, title) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.title = title;
        if (GLFW.active.id == win.id) {
            _emscripten_set_window_title(title)
        }
    },
    setJoystickCallback: cbfun => {
        const prevcbfun = GLFW.joystickFunc;
        GLFW.joystickFunc = cbfun;
        GLFW.refreshJoysticks();
        return prevcbfun
    },
    joys: {},
    lastGamepadState: [],
    lastGamepadStateFrame: null,
    refreshJoysticks: () => {
        if (Browser.mainLoop.currentFrameNumber !== GLFW.lastGamepadStateFrame || !Browser.mainLoop.currentFrameNumber) {
            GLFW.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads || [];
            GLFW.lastGamepadStateFrame = Browser.mainLoop.currentFrameNumber;
            for (const joy = 0; joy < GLFW.lastGamepadState.length; ++joy) {
                const gamepad = GLFW.lastGamepadState[joy];
                if (gamepad) {
                    if (!GLFW.joys[joy]) {
                        out("glfw joystick connected:", joy);
                        GLFW.joys[joy] = {
                            id: stringToNewUTF8(gamepad.id),
                            buttonsCount: gamepad.buttons.length,
                            axesCount: gamepad.axes.length,
                            buttons: _malloc(gamepad.buttons.length),
                            axes: _malloc(gamepad.axes.length * 4)
                        };
                        if (GLFW.joystickFunc) {
                            getWasmTableEntry(GLFW.joystickFunc)(joy, 262145)
                        }
                    }
                    const data = GLFW.joys[joy];
                    for (const i = 0; i < gamepad.buttons.length; ++i) {
                        HEAP8[data.buttons + i] = gamepad.buttons[i].pressed
                    }
                    for (const i = 0; i < gamepad.axes.length; ++i) {
                        HEAPF32[data.axes + i * 4 >> 2] = gamepad.axes[i]
                    }
                } else {
                    if (GLFW.joys[joy]) {
                        out("glfw joystick disconnected", joy);
                        if (GLFW.joystickFunc) {
                            getWasmTableEntry(GLFW.joystickFunc)(joy, 262146)
                        }
                        _free(GLFW.joys[joy].id);
                        _free(GLFW.joys[joy].buttons);
                        _free(GLFW.joys[joy].axes);
                        delete GLFW.joys[joy]
                    }
                }
            }
        }
    },
    setKeyCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.keyFunc;
        win.keyFunc = cbfun;
        return prevcbfun
    },
    setCharCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.charFunc;
        win.charFunc = cbfun;
        return prevcbfun
    },
    setMouseButtonCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.mouseButtonFunc;
        win.mouseButtonFunc = cbfun;
        return prevcbfun
    },
    setCursorPosCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.cursorPosFunc;
        win.cursorPosFunc = cbfun;
        return prevcbfun
    },
    setScrollCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.scrollFunc;
        win.scrollFunc = cbfun;
        return prevcbfun
    },
    setDropCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.dropFunc;
        win.dropFunc = cbfun;
        return prevcbfun
    },
    onDrop: event => {
        if (!GLFW.active || !GLFW.active.dropFunc) return;
        if (!event.dataTransfer || !event.dataTransfer.files || event.dataTransfer.files.length == 0) return;
        event.preventDefault();
        const filenames = _malloc(event.dataTransfer.files.length * 4);
        const filenamesArray = [];
        const count = event.dataTransfer.files.length;
        const written = 0;
        const drop_dir = ".glfw_dropped_files";
        FS.createPath("/", drop_dir);

        function save(file) {
            const path = "/" + drop_dir + "/" + file.name.replace(/\//g, "_");
            const reader = new FileReader;
            reader.onloadend = e => {
                if (reader.readyState != 2) {
                    ++written;
                    out("failed to read dropped file: " + file.name + ": " + reader.error);
                    return
                }
                const data = e.target.result;
                FS.writeFile(path, new Uint8Array(data));
                if (++written === count) {
                    getWasmTableEntry(GLFW.active.dropFunc)(GLFW.active.id, count, filenames);
                    for (const i = 0; i < filenamesArray.length; ++i) {
                        _free(filenamesArray[i])
                    }
                    _free(filenames)
                }
            };
            reader.readAsArrayBuffer(file);
            const filename = stringToNewUTF8(path);
            filenamesArray.push(filename);
            HEAPU32[filenames + i * 4 >> 2] = filename
        }
        for (const i = 0; i < count; ++i) {
            save(event.dataTransfer.files[i])
        }
        return false
    },
    onDragover: event => {
        if (!GLFW.active || !GLFW.active.dropFunc) return;
        event.preventDefault();
        return false
    },
    setWindowSizeCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.windowSizeFunc;
        win.windowSizeFunc = cbfun;
        return prevcbfun
    },
    setWindowCloseCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.windowCloseFunc;
        win.windowCloseFunc = cbfun;
        return prevcbfun
    },
    setWindowRefreshCallback: (winid, cbfun) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return null;
        const prevcbfun = win.windowRefreshFunc;
        win.windowRefreshFunc = cbfun;
        return prevcbfun
    },
    onClickRequestPointerLock: e => {
        if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
            Module["canvas"].requestPointerLock();
            e.preventDefault()
        }
    },
    setInputMode: (winid, mode, value) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return;
        switch (mode) {
            case 208897: {
                switch (value) {
                    case 212993: {
                        win.inputModes[mode] = value;
                        Module["canvas"].removeEventListener("click", GLFW.onClickRequestPointerLock, true);
                        Module["canvas"].exitPointerLock();
                        break
                    }
                    case 212994: {
                        err("glfwSetInputMode called with GLFW_CURSOR_HIDDEN value not implemented");
                        break
                    }
                    case 212995: {
                        win.inputModes[mode] = value;
                        Module["canvas"].addEventListener("click", GLFW.onClickRequestPointerLock, true);
                        Module["canvas"].requestPointerLock();
                        break
                    }
                    default: {
                        err(`glfwSetInputMode called with unknown value parameter value: ${value}`);
                        break
                    }
                }
                break
            }
            case 208898: {
                err("glfwSetInputMode called with GLFW_STICKY_KEYS mode not implemented");
                break
            }
            case 208899: {
                err("glfwSetInputMode called with GLFW_STICKY_MOUSE_BUTTONS mode not implemented");
                break
            }
            case 208900: {
                err("glfwSetInputMode called with GLFW_LOCK_KEY_MODS mode not implemented");
                break
            }
            case 3342341: {
                err("glfwSetInputMode called with GLFW_RAW_MOUSE_MOTION mode not implemented");
                break
            }
            default: {
                err(`glfwSetInputMode called with unknown mode parameter value: ${mode}`);
                break
            }
        }
    },
    getKey: (winid, key) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return 0;
        return win.keys[key]
    },
    getMouseButton: (winid, button) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return 0;
        return (win.buttons & 1 << button) > 0
    },
    getCursorPos: (winid, x, y) => {
        HEAPF64[x >> 3] = Browser.mouseX;
        HEAPF64[y >> 3] = Browser.mouseY
    },
    getMousePos: (winid, x, y) => {
        HEAP32[x >> 2] = Browser.mouseX;
        HEAP32[y >> 2] = Browser.mouseY
    },
    setCursorPos: (winid, x, y) => {},
    getWindowPos: (winid, x, y) => {
        const wx = 0;
        const wy = 0;
        const win = GLFW.WindowFromId(winid);
        if (win) {
            wx = win.x;
            wy = win.y
        }
        if (x) {
            HEAP32[x >> 2] = wx
        }
        if (y) {
            HEAP32[y >> 2] = wy
        }
    },
    setWindowPos: (winid, x, y) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.x = x;
        win.y = y
    },
    getWindowSize: (winid, width, height) => {
        const ww = 0;
        const wh = 0;
        const win = GLFW.WindowFromId(winid);
        if (win) {
            ww = win.width;
            wh = win.height
        }
        if (width) {
            HEAP32[width >> 2] = ww
        }
        if (height) {
            HEAP32[height >> 2] = wh
        }
    },
    setWindowSize: (winid, width, height) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return;
        if (GLFW.active.id == win.id) {
            Browser.setCanvasSize(width, height)
        }
    },
    defaultWindowHints: () => {
        GLFW.hints = Object.assign({}, GLFW.defaultHints)
    },
    createWindow: (width, height, title, monitor, share) => {
        const i, id;
        for (i = 0; i < GLFW.windows.length && GLFW.windows[i] !== null; i++) {}
        if (i > 0) throw "glfwCreateWindow only supports one window at time currently";
        id = i + 1;
        if (width <= 0 || height <= 0) return 0;
        if (monitor) {
            Browser.requestFullscreen()
        } else {
            Browser.setCanvasSize(width, height)
        }
        for (i = 0; i < GLFW.windows.length && GLFW.windows[i] == null; i++) {}
        const useWebGL = GLFW.hints[139265] > 0;
        if (i == GLFW.windows.length) {
            if (useWebGL) {
                const contextAttributes = {
                    antialias: GLFW.hints[135181] > 1,
                    depth: GLFW.hints[135173] > 0,
                    stencil: GLFW.hints[135174] > 0,
                    alpha: GLFW.hints[135172] > 0
                };
                Module.ctx = Browser.createContext(Module["canvas"], true, true, contextAttributes)
            } else {
                Browser.init()
            }
        }
        if (!Module.ctx && useWebGL) return 0;
        const canvas = Module["canvas"];
        const win = new GLFW_Window(id, canvas.clientWidth, canvas.clientHeight, canvas.width, canvas.height, title, monitor, share);
        if (id - 1 == GLFW.windows.length) {
            GLFW.windows.push(win)
        } else {
            GLFW.windows[id - 1] = win
        }
        GLFW.active = win;
        GLFW.adjustCanvasDimensions();
        return win.id
    },
    destroyWindow: winid => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return;
        if (win.windowCloseFunc) {
            getWasmTableEntry(win.windowCloseFunc)(win.id)
        }
        GLFW.windows[win.id - 1] = null;
        if (GLFW.active.id == win.id) GLFW.active = null;
        for (const i = 0; i < GLFW.windows.length; i++)
            if (GLFW.windows[i] !== null) return;
        delete Module.ctx
    },
    swapBuffers: winid => {},
    requestFullscreen(lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer == "undefined") Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas == "undefined") Browser.resizeCanvas = false;
        const canvas = Module["canvas"];

        function fullscreenChange() {
            Browser.isFullscreen = false;
            const canvasContainer = canvas.parentNode;
            if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                canvas.exitFullscreen = Browser.exitFullscreen;
                if (Browser.lockPointer) canvas.requestPointerLock();
                Browser.isFullscreen = true;
                if (Browser.resizeCanvas) {
                    Browser.setFullscreenCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas);
                    Browser.updateResizeListeners()
                }
            } else {
                canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                canvasContainer.parentNode.removeChild(canvasContainer);
                if (Browser.resizeCanvas) {
                    Browser.setWindowedCanvasSize()
                } else {
                    Browser.updateCanvasDimensions(canvas);
                    Browser.updateResizeListeners()
                }
            }
            Module["onFullScreen"]?.(Browser.isFullscreen);
            Module["onFullscreen"]?.(Browser.isFullscreen)
        }
        if (!Browser.fullscreenHandlersInstalled) {
            Browser.fullscreenHandlersInstalled = true;
            document.addEventListener("fullscreenchange", fullscreenChange, false);
            document.addEventListener("mozfullscreenchange", fullscreenChange, false);
            document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
            document.addEventListener("MSFullscreenChange", fullscreenChange, false)
        }
        const canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? () => canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null) || (canvasContainer["webkitRequestFullScreen"] ? () => canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]) : null);
        canvasContainer.requestFullscreen()
    },
    updateCanvasDimensions(canvas, wNative, hNative) {
        const scale = GLFW.getHiDPIScale();
        if (wNative && hNative) {
            canvas.widthNative = wNative;
            canvas.heightNative = hNative
        } else {
            wNative = canvas.widthNative;
            hNative = canvas.heightNative
        }
        const w = wNative;
        const h = hNative;
        if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
            if (w / h < Module["forcedAspectRatio"]) {
                w = Math.round(h * Module["forcedAspectRatio"])
            } else {
                h = Math.round(w / Module["forcedAspectRatio"])
            }
        }
        if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
            const factor = Math.min(screen.width / w, screen.height / h);
            w = Math.round(w * factor);
            h = Math.round(h * factor)
        }
        if (Browser.resizeCanvas) {
            wNative = w;
            hNative = h
        }
        const wNativeScaled = Math.floor(wNative * scale);
        const hNativeScaled = Math.floor(hNative * scale);
        if (canvas.width != wNativeScaled) canvas.width = wNativeScaled;
        if (canvas.height != hNativeScaled) canvas.height = hNativeScaled;
        if (typeof canvas.style != "undefined") {
            if (wNativeScaled != wNative || hNativeScaled != hNative) {
                canvas.style.setProperty("width", wNative + "px", "important");
                canvas.style.setProperty("height", hNative + "px", "important")
            } else {
                canvas.style.removeProperty("width");
                canvas.style.removeProperty("height")
            }
        }
    },
    calculateMouseCoords(pageX, pageY) {
        const rect = Module["canvas"].getBoundingClientRect();
        const cw = Module["canvas"].clientWidth;
        const ch = Module["canvas"].clientHeight;
        const scrollX = typeof window.scrollX != "undefined" ? window.scrollX : window.pageXOffset;
        const scrollY = typeof window.scrollY != "undefined" ? window.scrollY : window.pageYOffset;
        const adjustedX = pageX - (scrollX + rect.left);
        const adjustedY = pageY - (scrollY + rect.top);
        adjustedX = adjustedX * (cw / rect.width);
        adjustedY = adjustedY * (ch / rect.height);
        return {
            x: adjustedX,
            y: adjustedY
        }
    },
    setWindowAttrib: (winid, attrib, value) => {
        const win = GLFW.WindowFromId(winid);
        if (!win) return;
        const isHiDPIAware = GLFW.isHiDPIAware();
        win.attributes[attrib] = value;
        if (isHiDPIAware !== GLFW.isHiDPIAware()) GLFW.adjustCanvasDimensions()
    },
    getDevicePixelRatio() {
        return typeof devicePixelRatio == "number" && devicePixelRatio || 1
    },
    isHiDPIAware() {
        if (GLFW.active) return GLFW.active.attributes[139276] > 0;
        else return false
    },
    adjustCanvasDimensions() {
        const canvas = Module["canvas"];
        Browser.updateCanvasDimensions(canvas, canvas.clientWidth, canvas.clientHeight);
        Browser.updateResizeListeners()
    },
    getHiDPIScale() {
        return GLFW.isHiDPIAware() ? GLFW.scale : 1
    },
    onDevicePixelRatioChange() {
        GLFW.onWindowContentScaleChanged(GLFW.getDevicePixelRatio());
        GLFW.adjustCanvasDimensions()
    },
    GLFW2ParamToGLFW3Param: param => {
        const table = {
            196609: 0,
            196610: 0,
            196611: 0,
            196612: 0,
            196613: 0,
            196614: 0,
            131073: 0,
            131074: 0,
            131075: 0,
            131076: 0,
            131077: 135169,
            131078: 135170,
            131079: 135171,
            131080: 135172,
            131081: 135173,
            131082: 135174,
            131083: 135183,
            131084: 135175,
            131085: 135176,
            131086: 135177,
            131087: 135178,
            131088: 135179,
            131089: 135180,
            131090: 0,
            131091: 135181,
            131092: 139266,
            131093: 139267,
            131094: 139270,
            131095: 139271,
            131096: 139272
        };
        return table[param]
    }
};
const _glfwCreateWindow = (width, height, title, monitor, share) => GLFW.createWindow(width, height, title, monitor, share);
const _glfwDefaultWindowHints = () => GLFW.defaultWindowHints();
const _glfwDestroyWindow = winid => GLFW.destroyWindow(winid);
const _glfwGetPrimaryMonitor = () => 1;
const _glfwGetTime = () => GLFW.getTime() - GLFW.initialTime;
const _glfwGetVideoModes = (monitor, count) => {
    HEAP32[count >> 2] = 0;
    return 0
};
const _glfwInit = () => {
    if (GLFW.windows) return 1;
    GLFW.initialTime = GLFW.getTime();
    GLFW.defaultWindowHints();
    GLFW.windows = new Array;
    GLFW.active = null;
    GLFW.scale = GLFW.getDevicePixelRatio();
    window.addEventListener("gamepadconnected", GLFW.onGamepadConnected, true);
    window.addEventListener("gamepaddisconnected", GLFW.onGamepadDisconnected, true);
    window.addEventListener("keydown", GLFW.onKeydown, true);
    window.addEventListener("keypress", GLFW.onKeyPress, true);
    window.addEventListener("keyup", GLFW.onKeyup, true);
    window.addEventListener("blur", GLFW.onBlur, true);
    GLFW.devicePixelRatioMQL = window.matchMedia("(resolution: " + GLFW.getDevicePixelRatio() + "dppx)");
    GLFW.devicePixelRatioMQL.addEventListener("change", GLFW.onDevicePixelRatioChange);
    Module["canvas"].addEventListener("touchmove", GLFW.onMousemove, true);
    Module["canvas"].addEventListener("touchstart", GLFW.onMouseButtonDown, true);
    Module["canvas"].addEventListener("touchcancel", GLFW.onMouseButtonUp, true);
    Module["canvas"].addEventListener("touchend", GLFW.onMouseButtonUp, true);
    Module["canvas"].addEventListener("mousemove", GLFW.onMousemove, true);
    Module["canvas"].addEventListener("mousedown", GLFW.onMouseButtonDown, true);
    Module["canvas"].addEventListener("mouseup", GLFW.onMouseButtonUp, true);
    Module["canvas"].addEventListener("wheel", GLFW.onMouseWheel, true);
    Module["canvas"].addEventListener("mousewheel", GLFW.onMouseWheel, true);
    Module["canvas"].addEventListener("mouseenter", GLFW.onMouseenter, true);
    Module["canvas"].addEventListener("mouseleave", GLFW.onMouseleave, true);
    Module["canvas"].addEventListener("drop", GLFW.onDrop, true);
    Module["canvas"].addEventListener("dragover", GLFW.onDragover, true);
    Browser.requestFullscreen = GLFW.requestFullscreen;
    Browser.calculateMouseCoords = GLFW.calculateMouseCoords;
    Browser.updateCanvasDimensions = GLFW.updateCanvasDimensions;
    Browser.resizeListeners.push((width, height) => {
        if (GLFW.isHiDPIAware()) {
            const canvas = Module["canvas"];
            GLFW.onCanvasResize(canvas.clientWidth, canvas.clientHeight, width, height)
        } else {
            GLFW.onCanvasResize(width, height, width, height)
        }
    });
    return 1
};
const _glfwMakeContextCurrent = winid => {};
const _glfwSetCharCallback = (winid, cbfun) => GLFW.setCharCallback(winid, cbfun);
const _glfwSetCursorEnterCallback = (winid, cbfun) => {
    const win = GLFW.WindowFromId(winid);
    if (!win) return null;
    const prevcbfun = win.cursorEnterFunc;
    win.cursorEnterFunc = cbfun;
    return prevcbfun
};
const _glfwSetCursorPosCallback = (winid, cbfun) => GLFW.setCursorPosCallback(winid, cbfun);
const _glfwSetDropCallback = (winid, cbfun) => GLFW.setDropCallback(winid, cbfun);
const _glfwSetErrorCallback = cbfun => {
    const prevcbfun = GLFW.errorFunc;
    GLFW.errorFunc = cbfun;
    return prevcbfun
};
const _glfwSetKeyCallback = (winid, cbfun) => GLFW.setKeyCallback(winid, cbfun);
const _glfwSetMouseButtonCallback = (winid, cbfun) => GLFW.setMouseButtonCallback(winid, cbfun);
const _glfwSetScrollCallback = (winid, cbfun) => GLFW.setScrollCallback(winid, cbfun);
const _glfwSetWindowContentScaleCallback = (winid, cbfun) => {
    const win = GLFW.WindowFromId(winid);
    if (!win) return null;
    const prevcbfun = win.windowContentScaleFunc;
    win.windowContentScaleFunc = cbfun;
    return prevcbfun
};
const _glfwSetWindowFocusCallback = (winid, cbfun) => {
    const win = GLFW.WindowFromId(winid);
    if (!win) return null;
    const prevcbfun = win.windowFocusFunc;
    win.windowFocusFunc = cbfun;
    return prevcbfun
};
const _glfwSetWindowIconifyCallback = (winid, cbfun) => {
    const win = GLFW.WindowFromId(winid);
    if (!win) return null;
    const prevcbfun = win.windowIconifyFunc;
    win.windowIconifyFunc = cbfun;
    return prevcbfun
};
const _glfwSetWindowShouldClose = (winid, value) => {
    const win = GLFW.WindowFromId(winid);
    if (!win) return;
    win.shouldClose = value
};
const _glfwSetWindowSizeCallback = (winid, cbfun) => GLFW.setWindowSizeCallback(winid, cbfun);
const _glfwSwapBuffers = winid => GLFW.swapBuffers(winid);
const _glfwTerminate = () => {
    window.removeEventListener("gamepadconnected", GLFW.onGamepadConnected, true);
    window.removeEventListener("gamepaddisconnected", GLFW.onGamepadDisconnected, true);
    window.removeEventListener("keydown", GLFW.onKeydown, true);
    window.removeEventListener("keypress", GLFW.onKeyPress, true);
    window.removeEventListener("keyup", GLFW.onKeyup, true);
    window.removeEventListener("blur", GLFW.onBlur, true);
    Module["canvas"].removeEventListener("touchmove", GLFW.onMousemove, true);
    Module["canvas"].removeEventListener("touchstart", GLFW.onMouseButtonDown, true);
    Module["canvas"].removeEventListener("touchcancel", GLFW.onMouseButtonUp, true);
    Module["canvas"].removeEventListener("touchend", GLFW.onMouseButtonUp, true);
    Module["canvas"].removeEventListener("mousemove", GLFW.onMousemove, true);
    Module["canvas"].removeEventListener("mousedown", GLFW.onMouseButtonDown, true);
    Module["canvas"].removeEventListener("mouseup", GLFW.onMouseButtonUp, true);
    Module["canvas"].removeEventListener("wheel", GLFW.onMouseWheel, true);
    Module["canvas"].removeEventListener("mousewheel", GLFW.onMouseWheel, true);
    Module["canvas"].removeEventListener("mouseenter", GLFW.onMouseenter, true);
    Module["canvas"].removeEventListener("mouseleave", GLFW.onMouseleave, true);
    Module["canvas"].removeEventListener("drop", GLFW.onDrop, true);
    Module["canvas"].removeEventListener("dragover", GLFW.onDragover, true);
    if (GLFW.devicePixelRatioMQL) GLFW.devicePixelRatioMQL.removeEventListener("change", GLFW.onDevicePixelRatioChange);
    Module["canvas"].width = Module["canvas"].height = 1;
    GLFW.windows = null;
    GLFW.active = null
};
const _glfwWindowHint = (target, hint) => {
    GLFW.hints[target] = hint
};
FS.createPreloadedFile = FS_createPreloadedFile;
FS.staticInit();
Module["requestFullscreen"] = Browser.requestFullscreen;
Module["requestAnimationFrame"] = Browser.requestAnimationFrame;
Module["setCanvasSize"] = Browser.setCanvasSize;
Module["pauseMainLoop"] = Browser.mainLoop.pause;
Module["resumeMainLoop"] = Browser.mainLoop.resume;
Module["getUserMedia"] = Browser.getUserMedia;
Module["createContext"] = Browser.createContext;
const preloadedImages = {};
const preloadedAudios = {};
const miniTempWebGLFloatBuffersStorage = new Float32Array(288);
for (const i = 0; i <= 288; ++i) {
    miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i)
}
const wasmImports = {
    wa: GetWindowInnerHeight,
    xa: GetWindowInnerWidth,
    q: ___assert_fail,
    db: ___syscall_faccessat,
    N: ___syscall_fcntl64,
    Ya: ___syscall_getcwd,
    _a: ___syscall_ioctl,
    $a: ___syscall_openat,
    ab: __emscripten_get_now_is_monotonic,
    cb: __emscripten_memcpy_js,
    A: _emscripten_asm_const_int,
    bb: _emscripten_date_now,
    P: _emscripten_get_element_css_size,
    ra: _emscripten_get_gamepad_status,
    v: _emscripten_get_now,
    sa: _emscripten_get_num_gamepads,
    Xa: _emscripten_resize_heap,
    ta: _emscripten_sample_gamepad_data,
    va: _emscripten_set_canvas_element_size,
    _: _emscripten_set_click_callback_on_thread,
    aa: _emscripten_set_fullscreenchange_callback_on_thread,
    S: _emscripten_set_gamepadconnected_callback_on_thread,
    R: _emscripten_set_gamepaddisconnected_callback_on_thread,
    hb: _emscripten_set_main_loop,
    X: _emscripten_set_mousemove_callback_on_thread,
    Y: _emscripten_set_pointerlockchange_callback_on_thread,
    $: _emscripten_set_resize_callback_on_thread,
    T: _emscripten_set_touchcancel_callback_on_thread,
    V: _emscripten_set_touchend_callback_on_thread,
    U: _emscripten_set_touchmove_callback_on_thread,
    W: _emscripten_set_touchstart_callback_on_thread,
    ya: _emscripten_set_window_title,
    eb: _exit,
    O: _fd_close,
    Za: _fd_read,
    Wa: _fd_seek,
    L: _fd_write,
    M: _glActiveTexture,
    C: _glAttachShader,
    h: _glBindAttribLocation,
    a: _glBindBuffer,
    g: _glBindTexture,
    f: _glBindVertexArray,
    Qa: _glBlendFunc,
    l: _glBufferData,
    p: _glBufferSubData,
    I: _glClear,
    J: _glClearColor,
    Na: _glClearDepthf,
    Da: _glCompileShader,
    Ja: _glCompressedTexImage2D,
    Ba: _glCreateProgram,
    Fa: _glCreateShader,
    Sa: _glCullFace,
    k: _glDeleteBuffers,
    F: _glDeleteProgram,
    G: _glDeleteShader,
    E: _glDeleteTextures,
    Ha: _glDeleteVertexArrays,
    Pa: _glDepthFunc,
    H: _glDetachShader,
    Ta: _glDisable,
    o: _glDisableVertexAttribArray,
    Va: _glDrawArrays,
    Ua: _glDrawElements,
    K: _glEnable,
    d: _glEnableVertexAttribArray,
    Oa: _glFrontFace,
    m: _glGenBuffers,
    La: _glGenTextures,
    Ia: _glGenVertexArrays,
    t: _glGetAttribLocation,
    Ra: _glGetFloatv,
    za: _glGetProgramInfoLog,
    B: _glGetProgramiv,
    Ca: _glGetShaderInfoLog,
    D: _glGetShaderiv,
    n: _glGetString,
    s: _glGetUniformLocation,
    Aa: _glLinkProgram,
    Ma: _glPixelStorei,
    Ga: _glReadPixels,
    Ea: _glShaderSource,
    Ka: _glTexImage2D,
    u: _glTexParameterf,
    i: _glTexParameteri,
    gb: _glUniform1i,
    Z: _glUniform4f,
    j: _glUniformMatrix4fv,
    r: _glUseProgram,
    e: _glVertexAttribPointer,
    w: _glViewport,
    y: _glfwCreateWindow,
    oa: _glfwDefaultWindowHints,
    fb: _glfwDestroyWindow,
    z: _glfwGetPrimaryMonitor,
    b: _glfwGetTime,
    na: _glfwGetVideoModes,
    pa: _glfwInit,
    ba: _glfwMakeContextCurrent,
    ga: _glfwSetCharCallback,
    ca: _glfwSetCursorEnterCallback,
    ea: _glfwSetCursorPosCallback,
    ja: _glfwSetDropCallback,
    qa: _glfwSetErrorCallback,
    ha: _glfwSetKeyCallback,
    fa: _glfwSetMouseButtonCallback,
    da: _glfwSetScrollCallback,
    ia: _glfwSetWindowContentScaleCallback,
    ka: _glfwSetWindowFocusCallback,
    la: _glfwSetWindowIconifyCallback,
    Q: _glfwSetWindowShouldClose,
    ma: _glfwSetWindowSizeCallback,
    ua: _glfwSwapBuffers,
    x: _glfwTerminate,
    c: _glfwWindowHint
};
const wasmExports = createWasm();
const ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["jb"])();
const _main = Module["_main"] = (a0, a1) => (_main = Module["_main"] = wasmExports["kb"])(a0, a1);
const _malloc = a0 => (_malloc = wasmExports["mb"])(a0);
const _free = a0 => (_free = wasmExports["nb"])(a0);
const calledRun;
dependenciesFulfilled = function runCaller() {
    if (!calledRun) run();
    if (!calledRun) dependenciesFulfilled = runCaller
};

function callMain() {
    const entryFunction = _main;
    const argc = 0;
    const argv = 0;
    try {
        const ret = entryFunction(argc, argv);
        exitJS(ret, true);
        return ret
    } catch (e) {
        return handleException(e)
    }
}

function run() {
    if (runDependencies > 0) {
        return
    }
    preRun();
    if (runDependencies > 0) {
        return
    }

    function doRun() {
        if (calledRun) return;
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) return;
        initRuntime();
        preMain();
        Module["onRuntimeInitialized"]?.();
        if (shouldRunNow) callMain();
        postRun()
    }
    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function() {
            setTimeout(function() {
                Module["setStatus"]("")
            }, 1);
            doRun()
        }, 1)
    } else {
        doRun()
    }
}
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()()
    }
}
const shouldRunNow = true;
if (Module["noInitialRun"]) shouldRunNow = false;
run();
