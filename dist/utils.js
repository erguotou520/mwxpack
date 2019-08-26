"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
function error(str) {
    console.log(chalk_1.default.red(str));
}
exports.error = error;
function warn(str) {
    console.log(chalk_1.default.yellow(str));
}
exports.warn = warn;
