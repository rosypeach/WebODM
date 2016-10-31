import React from 'react';
import './css/Console.scss';
import './vendor/google-code-prettify/prettify';
import './vendor/google-code-prettify/prettify.css';
import update from 'react-addons-update';
import Utils from './classes/Utils';

class Console extends React.Component {
  constructor(props){
    super();

    this.state = {
      lines: []
    };

    if (typeof props.children === "string"){
      this.state.lines = props.children.split('\n');
    }

    this.autoscroll = props.autoscroll === true;

    this.setRef = this.setRef.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  componentDidMount(){
    this.checkAutoscroll();

    // Dynamic source?
    if (this.props.source !== undefined){
      let currentLineNumber = 0;

      const updateFromSource = () => {
        let sourceUrl = typeof this.props.source === 'function' ?
                       this.props.source(currentLineNumber) :
                       this.props.source;

        // Fetch
        this.sourceRequest = $.get(sourceUrl, text => {
          let lines = text.split("\n");
          lines.forEach(line => this.addLine(line));
          currentLineNumber += (lines.length - 1);
        })
        .always(() => {
          if (this.props.refreshInterval !== undefined){
            this.sourceTimeout = setTimeout(updateFromSource, this.props.refreshInterval);
          }
        });
      };

      updateFromSource();
    }
  }

  componentWillUnmount(){
    if (this.sourceTimeout) clearTimeout(this.sourceTimeout);
    if (this.sourceRequest) this.sourceRequest.abort();
  }

  setRef(domNode){
    if (domNode != null){
      this.$console = $(domNode);
    }
  }

  handleMouseOver(){
    this.autoscroll = false;
  }

  handleMouseOut(){
    this.autoscroll = this.props.autoscroll === true;
  }

  checkAutoscroll(){
    if (this.$console && this.autoscroll){
      this.$console.scrollTop(this.$console[0].scrollHeight - this.$console.height());
    }
  }

  addLine(text){
    this.setState(update(this.state, {
      lines: {$push: [text]}
    }));
    this.checkAutoscroll();
  }

  render() {
    const prettyLine = (line) => {
      // TODO Escape
      return {__html: prettyPrintOne(Utils.escapeHtml(line), this.props.lang, this.props.lines)};
    }
    let i = 0;

    return (
      <pre className={`console prettyprint 
          ${this.props.lang ? `lang-${this.props.lang}` : ""} 
          ${this.props.lines ? "linenums" : ""}`}
          style={{height: (this.props.height ? this.props.height : "auto")}}
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          ref={this.setRef}
        >

        {this.state.lines.map(line => {
          if (this.props.lang) return (<div key={i++} dangerouslySetInnerHTML={prettyLine(line)}></div>);
          else return line + "\n";
        })}
      </pre>
    );
  }
}

export default Console;
