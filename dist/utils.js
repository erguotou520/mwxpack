"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
function debug(str) {
    console.log(chalk_1.default.grey(str));
}
exports.debug = debug;
function log(str) {
    console.log(chalk_1.default.blue(str));
}
exports.log = log;
function error(str) {
    console.log(chalk_1.default.red(str));
}
exports.error = error;
function warn(str) {
    console.log(chalk_1.default.yellow(str));
}
exports.warn = warn;
