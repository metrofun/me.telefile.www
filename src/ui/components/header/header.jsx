var React = require('react'),
    Navbar = require('../navbar/navbar.jsx');

class Header extends React.Component {
    _onShare(e) {
        var width, height, left, top;

        // event delegation
        if (e.target.className === 'share__link') {
            width = 800;
            height = 500;
            left = screen.width / 2 - width / 2;
            top = screen.height / 2 - height / 2;

            e.preventDefault();

            window.open(e.target.href, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width="
                        + width + ",height=" + height+ ",top=" + top + ",left=" + left);
        }
    }
    render() {
        return (
            <div className="header">
                <div className="brand">
                    <a className="brand_link" href="/">
                        <div className="brand__tele">tele</div>
                        <div className="brand__logo"></div>
                        <div className="brand__file">file</div>
                    </a>
                </div>
                <div className="share menu menu_col_4 menu_align_right">
                    <input className="menu__checkbox" id="menu__checkbox-2" type="checkbox" />
                    <label className="menu__toggle share__toggle" htmlFor="menu__checkbox-2"></label>
                    <ul className="menu__list">
                        <li className="menu__item share__item share__twitter">
                            <a className="share__link" title="Share on Twitter" target="_blank" href="//twitter.com/TeleFileMe">&nbsp;</a>
                        </li>
                        <li className="menu__item share__item share__facebook">
                            <a className="share__link" title="Share on Facebook" target="_blank" href="//www.facebook.com/TeleFileMe/timeline">&nbsp;</a>
                        </li>
                        <li className="menu__item share__item share__linkedin">
                            <a className="share__link" title="Share on LinkedIn" target="_blank" href="https://www.linkedin.com/shareArticle?mini=true&url=https://telefile.me&title=TeleFile.Me%20%E2%80%93%20Peer-to-peer%20file%20sharing%20tool&summary=&source=">&nbsp;</a>
                        </li>
                    </ul>
                </div>
                <Navbar />
            </div>
        );
    }
}

module.exports = Header;
