import { LitElement, html, css, svg, CSSResultGroup, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("x-text-teller")
export class TextTeller extends LitElement {
  @property({ type: String }) selector = "";
  @property({ type: String }) lang = navigator.language ?? "en-US";
  @property({ type: String }) text = "";
  @property({ type: Boolean }) initialPlay = true;
  @property({ type: Boolean }) playing = false;
  @property({ type: Number }) startTimeInMiliseconds = 0;
  @property({ type: Number }) endTimeInMiliseconds = 0;

  static styles:CSSResultGroup = css`
    svg {
      width: 25px;
      height: 25px;
      cursor: pointer;
    }
  `;

  private _isSelectorDefined() {
    if (this.selector === "") {
      console.log("Please define your HTML wrapper selector, eg. '#ritzy'");
      return false;
    }
    return true;
  }

  private svgPlayButton = svg`
    <?xml version="1.0" standalone="no"?>
    <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" fill="none" width="24" height="24" />
      <g>
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-2 14.5v-9l6 4.5z" />
      </g>
    </svg>
    `;

  private svgPauseButton = svg`
      <?xml version="1.0" encoding="iso-8859-1"?>
      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 60 60" style="enable-background:new 0 0 60 60;" xml:space="preserve">
        <path d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M27,46h-8V14h8V46z M41,46h-8V14h8V46z" />
      </svg>
    `;

  private playingText = `Reading...`;

  private _play() {
    if (!this._isSelectorDefined()) {
      return;
    }

    const allElements = document.querySelectorAll(this.selector);

    this.text += Array.from(allElements).reduce(
      (prev, current) => (prev !== "" ? ", " : "") + current.textContent + ".",
      ""
    );

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(this.text);

      utterance.lang = this.lang;
      utterance.rate = 1;

      utterance.onstart = () => {
        this.startTimeInMiliseconds = Date.now();
      };

      utterance.onend = () => {
        window.speechSynthesis.cancel();
        this.playing = false;
        this.initialPlay = true;
        this.endTimeInMiliseconds = Math.floor(
          (Date.now() - this.startTimeInMiliseconds) / 1000
        );
      };

      if (this.initialPlay) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        this.playing = true;
      } else {
        window.speechSynthesis.resume();
        this.playing = true;
      }

      this.initialPlay = false;

      this.text = "";
    }
  }

  private _pause() {
    window.speechSynthesis.pause();
    this.playing = false;
  }

  render():TemplateResult|undefined {
    if (!this._isSelectorDefined()) {
      return;
    }
    return this.playing
      ? html`<span @click="${this._pause}">${this.svgPauseButton}</span
          ><span>${this.playingText}</span>`
      : html`<span @click="${this._play}">${this.svgPlayButton}</span>`;
  }
}
