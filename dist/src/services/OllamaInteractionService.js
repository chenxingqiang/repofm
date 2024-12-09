"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ollamaService = exports.OllamaInteractionService = void 0;
var ollama_1 = require("ollama");
var zod_1 = require("zod");
// Validation schema for Ollama interaction configuration
var OllamaConfigSchema = zod_1.z.object({
    model: zod_1.z.string().default('llama2'),
    temperature: zod_1.z.number().min(0).max(2).default(0.7),
    systemPrompt: zod_1.z.string().optional(),
    maxTokens: zod_1.z.number().positive().default(500),
    topK: zod_1.z.number().positive().optional(),
    topP: zod_1.z.number().min(0).max(1).optional(),
    repeatPenalty: zod_1.z.number().min(0).optional()
});
var OllamaInteractionService = /** @class */ (function () {
    function OllamaInteractionService(config) {
        if (config === void 0) { config = {}; }
        this.availableModels = [];
        this.config = OllamaConfigSchema.parse(config);
        this.initializeModels();
    }
    OllamaInteractionService.prototype.initializeModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ollama_1.default.list()];
                    case 1:
                        response = _a.sent();
                        this.availableModels = response.models;
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Failed to initialize models:', error_1);
                        this.availableModels = [];
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaInteractionService.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.availableModels.length === 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.initializeModels()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.availableModels];
                }
            });
        });
    };
    OllamaInteractionService.prototype.listLocalModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAvailableModels()];
                    case 1:
                        models = _a.sent();
                        return [2 /*return*/, models.map(function (model) { return model.name; })];
                }
            });
        });
    };
    OllamaInteractionService.prototype.setModel = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listLocalModels()];
                    case 1:
                        models = _a.sent();
                        if (models.includes(modelName)) {
                            this.config.model = modelName;
                        }
                        else {
                            throw new Error("Model ".concat(modelName, " is not available. Available models: ").concat(models.join(', ')));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    OllamaInteractionService.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    OllamaInteractionService.prototype.updateConfig = function (newConfig) {
        this.config = OllamaConfigSchema.parse(__assign(__assign({}, this.config), newConfig));
    };
    /**
     * Check if Ollama is running and accessible
     */
    OllamaInteractionService.prototype.isOllamaRunning = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ollama_1.default.list()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Ollama is not running:', error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate text using a local Ollama model
     */
    OllamaInteractionService.prototype.generateText = function (prompt_1) {
        return __awaiter(this, arguments, void 0, function (prompt, options) {
            var config, models, response, error_3;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isOllamaRunning()];
                    case 1:
                        // Validate Ollama is running
                        if (!(_a.sent())) {
                            throw new Error('Ollama is not running. Please start Ollama first.');
                        }
                        config = __assign(__assign({}, this.config), options);
                        return [4 /*yield*/, this.listLocalModels()];
                    case 2:
                        models = _a.sent();
                        // Validate model exists
                        if (!models.includes(config.model)) {
                            throw new Error("Model ".concat(config.model, " is not available. Available models: ").concat(models.join(', ')));
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, ollama_1.default.generate({
                                model: config.model,
                                prompt: prompt,
                                options: {
                                    temperature: config.temperature,
                                    num_predict: config.maxTokens,
                                    top_k: config.topK,
                                    top_p: config.topP,
                                    repeat_penalty: config.repeatPenalty
                                }
                            })];
                    case 4:
                        response = _a.sent();
                        return [2 /*return*/, response.response];
                    case 5:
                        error_3 = _a.sent();
                        console.error("Text generation failed with ".concat(config.model, ":"), error_3);
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Interactive chat with a local Ollama model
     */
    OllamaInteractionService.prototype.chat = function (messages_1) {
        return __awaiter(this, arguments, void 0, function (messages, options) {
            var config, models, response, error_4;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isOllamaRunning()];
                    case 1:
                        // Validate Ollama is running
                        if (!(_a.sent())) {
                            throw new Error('Ollama is not running. Please start Ollama first.');
                        }
                        config = __assign(__assign({}, this.config), options);
                        return [4 /*yield*/, this.listLocalModels()];
                    case 2:
                        models = _a.sent();
                        // Validate model exists
                        if (!models.includes(config.model)) {
                            throw new Error("Model ".concat(config.model, " is not available. Available models: ").concat(models.join(', ')));
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, ollama_1.default.chat({
                                model: config.model,
                                messages: messages,
                                options: {
                                    temperature: config.temperature,
                                    top_k: config.topK,
                                    top_p: config.topP,
                                    repeat_penalty: config.repeatPenalty
                                }
                            })];
                    case 4:
                        response = _a.sent();
                        return [2 /*return*/, response.message.content];
                    case 5:
                        error_4 = _a.sent();
                        console.error("Chat failed with ".concat(config.model, ":"), error_4);
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stream chat responses from a local Ollama model
     */
    OllamaInteractionService.prototype.streamChat = function (messages_1, onToken_1) {
        return __awaiter(this, arguments, void 0, function (messages, onToken, options) {
            var config, models, stream, _a, stream_1, stream_1_1, chunk, e_1_1, error_5;
            var _b, e_1, _c, _d;
            var _e;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, this.isOllamaRunning()];
                    case 1:
                        // Validate Ollama is running
                        if (!(_f.sent())) {
                            throw new Error('Ollama is not running. Please start Ollama first.');
                        }
                        config = __assign(__assign({}, this.config), options);
                        return [4 /*yield*/, this.listLocalModels()];
                    case 2:
                        models = _f.sent();
                        // Validate model exists
                        if (!models.includes(config.model)) {
                            throw new Error("Model ".concat(config.model, " is not available. Available models: ").concat(models.join(', ')));
                        }
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 17, , 18]);
                        return [4 /*yield*/, ollama_1.default.chat({
                                model: config.model,
                                messages: messages,
                                stream: true,
                                options: {
                                    temperature: config.temperature,
                                    top_k: config.topK,
                                    top_p: config.topP,
                                    repeat_penalty: config.repeatPenalty
                                }
                            })];
                    case 4:
                        stream = _f.sent();
                        _f.label = 5;
                    case 5:
                        _f.trys.push([5, 10, 11, 16]);
                        _a = true, stream_1 = __asyncValues(stream);
                        _f.label = 6;
                    case 6: return [4 /*yield*/, stream_1.next()];
                    case 7:
                        if (!(stream_1_1 = _f.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 9];
                        _d = stream_1_1.value;
                        _a = false;
                        chunk = _d;
                        if ((_e = chunk.message) === null || _e === void 0 ? void 0 : _e.content) {
                            onToken(chunk.message.content);
                        }
                        _f.label = 8;
                    case 8:
                        _a = true;
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _f.trys.push([11, , 14, 15]);
                        if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, _c.call(stream_1)];
                    case 12:
                        _f.sent();
                        _f.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_5 = _f.sent();
                        console.error("Streaming chat failed with ".concat(config.model, ":"), error_5);
                        throw error_5;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Interactive chat with a local Ollama model
     */
    OllamaInteractionService.prototype.interactiveChat = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var models, selectedIndex, messages, userInput, lastResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isOllamaRunning()];
                    case 1:
                        // Validate Ollama is running
                        if (!(_a.sent())) {
                            console.log('Ollama is not running. Please start Ollama and try again.');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.listLocalModels()];
                    case 2:
                        models = _a.sent();
                        if (models.length === 0) {
                            console.log('No local models found. Please pull a model using Ollama first.');
                            return [2 /*return*/];
                        }
                        if (!!modelName) return [3 /*break*/, 4];
                        console.log('Select a local model to chat with:');
                        models.forEach(function (model, i) {
                            console.log("".concat(i + 1, ". ").concat(model));
                        });
                        return [4 /*yield*/, new Promise(function (resolve) {
                                process.stdin.once('data', function (data) {
                                    resolve(parseInt(data.toString().trim()) - 1);
                                });
                            })];
                    case 3:
                        selectedIndex = _a.sent();
                        modelName = models[selectedIndex];
                        _a.label = 4;
                    case 4:
                        // Start interactive chat
                        console.log("Interactive Chat with ".concat(modelName));
                        messages = [];
                        // Optional system prompt
                        if (this.config.systemPrompt) {
                            messages.push({
                                role: 'system',
                                content: this.config.systemPrompt
                            });
                        }
                        _a.label = 5;
                    case 5:
                        if (!true) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                process.stdout.write('You: ');
                                process.stdin.once('data', function (data) {
                                    resolve(data.toString().trim());
                                });
                            })];
                    case 6:
                        userInput = _a.sent();
                        if (userInput.toLowerCase() === 'exit') {
                            console.log('Chat ended.');
                            return [3 /*break*/, 8];
                        }
                        messages.push({ role: 'user', content: userInput });
                        process.stdout.write('Assistant: ');
                        return [4 /*yield*/, this.streamChat(messages, function (token) { return process.stdout.write(token); }, { model: modelName })];
                    case 7:
                        _a.sent();
                        process.stdout.write('\n');
                        lastResponse = messages[messages.length - 1];
                        if (lastResponse.role === 'assistant') {
                            messages.push(lastResponse);
                        }
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return OllamaInteractionService;
}());
exports.OllamaInteractionService = OllamaInteractionService;
// Create a default service instance for easy import
exports.ollamaService = new OllamaInteractionService();
