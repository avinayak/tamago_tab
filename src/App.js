import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Icon from "@mdi/react";
import {
  mdiEyeOutline,
  mdiEyeOffOutline,
  mdiEyedropperVariant,
  mdiShuffle,
  mdiBookOutline,
  mdiMicrophoneOutline,
  mdiCardBulletedOffOutline,
  mdiCardTextOutline
} from "@mdi/js";
import dict from "./rtk";
import ReactTooltip from "react-tooltip";
import Popover from "react-tiny-popover";
import { TwitterPicker } from "react-color";
import ls from 'local-storage'

class App extends React.Component {
  wordsets = ["N4", "N4Words", "heisig","katakana"];
  constructor(props) {
    super(props);
    let preferences = {
      cardMode:true,
      expanded: true,
      index: 0,
      dispIndex: 1,
      background: "rgb(255, 182, 0)",
      wordsetIndex: 0,
    }
    let lsPref = ls.get('pref')
    if(!lsPref){
      ls.set('pref',preferences)
    }else{
      preferences = lsPref
    }
    this.state = {
      ...preferences,
      isPopoverOpen: false, 
      words: dict.filter(x => x.tags.indexOf(this.wordsets[preferences.wordsetIndex]) != -1)
    };
  }

  toggleexpanded = () => {
    this.setPreferenceAndState({ expanded: !this.state.expanded });
  };

  toggleCard = () => {
    this.setPreferenceAndState({ cardMode: !this.state.cardMode });
  }

  speak = () => {
    if('speechSynthesis' in window){
      var card = this.state.words[this.state.index];
      let kanji = card.kanji ? card.kanji : card.kunyomi;
      console.log(kanji)
      var speech = new SpeechSynthesisUtterance(kanji);
      speech.lang = 'ja-JP';
      window.speechSynthesis.speak(speech);
    }
  }

  switchWordSet = () => {
    let wordsetIndex = (this.state.wordsetIndex + 1) % this.wordsets.length;
    this.setState({words: dict.filter(x => x.tags.indexOf(this.wordsets[wordsetIndex]) != -1)})
    this.setPreferenceAndState({
      wordsetIndex,
      index: 0,
      dispIndex: 1,
    });
  };

  nextKanji = () => {
    let index =
      this.state.index < this.state.words.length - 1
        ? this.state.index + 1
        : this.state.words.length - 1;
    this.setPreferenceAndState({
      index,
      dispIndex: index + 1
    });
  };

  setPreference = (state) => {
    ls.set('pref',{...ls.get('pref'),...state})
  }

  setPreferenceAndState = (state) => {
    this.setPreference(state);
    this.setState(state);
  }

  handleColorChange = (color, event) => {
    var o = Math.round(
      (parseInt(color.rgb.r) * 299 +
        parseInt(color.rgb.g) * 587 +
        parseInt(color.rgb.b) * 114) /
        1000
    );
    var foreground = o > 125 ? "black" : "white";
    let state = { background: color.hex, foreground }
    this.setPreferenceAndState(state);
  };

  prevKanji = () => {
    let index = this.state.index > 0 ? this.state.index - 1 : 0;
    this.setPreferenceAndState({ index, dispIndex: index + 1 });
    // this.setPreference('index',index);
    // this.setPreference('dispIndex',index + 1 );
  };

  keyHandle = event => {
    console.log(event.keyCode);
    if (event.keyCode == 13) {
      let dispIndex = parseInt(this.state.dispIndex);
      if (dispIndex > 0 && dispIndex <= this.state.words.length){
        this.setPreferenceAndState({ index: dispIndex - 1 });
      }
       
    }
    if (event.keyCode == 68) {
      this.nextKanji();
    }
    if (event.keyCode == 65) {
      this.prevKanji();
    }
    if (event.keyCode == 69) {
      this.toggleexpanded();
    }
    if (event.keyCode == 83) {
      this.shuffle();
    }
    if (event.keyCode == 90) {
      this.speak();
    }
  };

  componentDidMount() {
    document.addEventListener("keydown", this.keyHandle, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyHandle, false);
  }

  shuffle = () => {
    this.setPreferenceAndState({
      index: Math.floor(Math.random() * this.state.words.length)
    });
  };

  handleIndexInput = event => {
    this.setPreferenceAndState({
      dispIndex: parseInt(event.target.value.replace(/\D/g, ""))
    });
  };
  

  render() {
    var { isPopoverOpen } = this.state;
    var card = this.state.words[this.state.index];
    let kanji = card.kanji ? card.kanji : card.kunyomi;
    return (
      <div className="App">
        <ReactTooltip />
        <div
          className="background"
          style={{ background: this.state.background }}
          onKeyDown={this.handleKeyPress}
        />
        <div className={`content ${this.state.cardMode && "card"}`} 
              style={{color:this.state.cardMode?"#111":this.state.foreground}}
              onKeyDown={this.handleKeyPress}>
          <div className={`kanji${Math.floor(kanji.length / 6)}`}>{kanji}</div>
          {this.state.expanded && (
            <div>
              <div data-tip="onyomi" className="onyomi">
                {card.onyomi}
              </div>
              <div data-tip="kunyomi" className="kunyomi">
                {card.kunyomi}
              </div>
              <br />
              <div data-tip="meaning" className="keyword">
                {card.keyword}
              </div>
              {card.elements && card.elements.length > 1 && (
                <div data-tip="component kanjis" className="components">
                  {card.elements.join(", ")}
                </div>
              )}
              <br />
              <div
                data-tip="heisig mnemonic"
                dangerouslySetInnerHTML={{ __html: card.heisig }}
                className="heisig"
              />
              <br />
              {card.commen && (
                <div
                  data-tip="heisig's comment"
                  dangerouslySetInnerHTML={{ __html: card.commen }}
                  className="notes"
                />
              )}
            </div>
          )}
        </div>

        <div
          className="next-button"
          onClick={this.nextKanji}
        />
        <div
          className="prev-button"
          onClick={this.prevKanji}
        />
        <div className="toolbar hovercharm">
          <Icon
            color={this.state.foreground}
            className="tool-button"
            onClick={this.switchWordSet}
            data-tip={"switch wordset"}
            path={mdiBookOutline}
            size={1}
          />
          <Icon
            color={this.state.foreground}
            className="tool-button"
            onClick={this.shuffle}
            data-tip="Shuffle (S)"
            path={mdiShuffle}
            size={1}
          />
          <Icon
            color={this.state.foreground}
            className="tool-button"
            onClick={this.toggleexpanded}
            data-tip="Expand card (E)"
            path={this.state.expanded ? mdiEyeOutline : mdiEyeOffOutline}
            size={1}
          />
          <Icon
            color={this.state.foreground}
            className="tool-button"
            onClick={this.toggleCard}
            data-tip="Toggle Card UI"
            path={this.state.cardMode ? mdiCardTextOutline : mdiCardBulletedOffOutline}
            size={1}
          />
          <Icon
            color={this.state.foreground}
            className="tool-button"
            onClick={this.speak}
            data-tip="Speak (Z)"
            path={mdiMicrophoneOutline}
            size={1}
          />
          <Popover
            isOpen={isPopoverOpen}
            onClickOutside={() => this.setState({ isPopoverOpen: false })}
            position={"top"} // preferred position
            content={
              <div>
                <TwitterPicker
                  color={this.state.background}
                  onChange={this.handleColorChange}
                />
              </div>
            }
          >
            <Icon
              color={this.state.foreground}
              className="tool-button"
              onClick={() => this.setState({ isPopoverOpen: !isPopoverOpen })}
            
              path={mdiEyedropperVariant}
              size={1}
            />
          </Popover>
        </div>
        <div
          style={{ color: this.state.foreground }}
          className="headerbar hovercharm"
        >
          #{" "}
          <input
            style={{ color: this.state.foreground }}
            className="indexinput"
            onChange={this.handleIndexInput}
            value={this.state.dispIndex + ""}
            contentEditable={true}
          />
          /{this.state.words.length} {this.wordsets[this.state.wordsetIndex]}
        </div>
      </div>
    );
  }
}

export default App;
