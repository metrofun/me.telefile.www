var React = require('react');

class Header extends React.Component {
    _onShare(e) {
        var width = 800,
            height = 500,
            left = screen.width / 2 - width / 2,
            top = screen.height / 2 - height / 2;

        e.preventDefault();

        window.open(e.target.href, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width="
                + width + ",height=" + height+ ",top=" + top + ",left=" + left);
    }
    render() {
        return (
            <div className="header">
                <div className="brand">
                    <div className="brand__tele">tele</div>
                    <div className="brand__logo"></div>
                    <div className="brand__file">file</div>
                </div>
                <div className="share">
                    <input className="share__checkbox" id="share__checkbox" type="checkbox" />
                    <label className="share__label" htmlFor="share__checkbox"></label>
                    <ul className="share__list" onClick={this._onShare}>
                        <li className="share__item share__twitter">
                            <a className="share__link" title="Share on Twitter" target="_blank" href="https://twitter.com/home?status=TeleFile.Me%20%E2%80%93%20free%20tool%20for%20peer-to-peer%20file%20share%20via%20%40TeleFileMe">&nbsp;</a>
                        </li>
                        <li className="share__item share__facebook">
                            <a className="share__link" title="Share on Facebook" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https://telefile.me">&nbsp;</a>
                        </li>
                        <li className="share__item share__linkedin">
                            <a className="share__link" title="Share on LinkedIn" target="_blank" href="https://www.linkedin.com/shareArticle?mini=true&url=https://telefile.me&title=TeleFile.Me%20%E2%80%93%20Peer-to-peer%20file%20sharing%20tool&summary=&source=">&nbsp;</a>
                        </li>
                    </ul>
                </div>
                <ul className="navbar">
                    <li className="navbar__item navbar__item_type_active">Home</li>
                    <li className="navbar__item">About</li>
                    <li className="navbar__item">Contact</li>
                </ul>
            </div>
        );
    }
}

module.exports = Header;
