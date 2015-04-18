var React = require('react'),
    routerStore = require('../../stores/router.js');

class Navbar extends React.Component {
    constructor(props) {
        super(props);

        this.state = routerStore.getState();

        console.log(this.state.parent);
    }
    render() {
        var items = this._ITEMS.map(function(item) {
            var className = 'menu__item navbar__item navbar__item_type_' + item.name;

            if (item.url === this.state.parent) {
                className += ' navbar__item_type_active';
            }

            return <li className={className}>
                <a className="navbar__link" href={item.url}>
                    <span className="navbar__icon"></span>
                    <span className="navbar__text">{item.name}</span>
                </a>
            </li>
        }, this);

        return (
            <div className="navbar menu menu_col_4 menu_align_left">
                <input className="menu__checkbox" type="checkbox" id="menu__checkbox-1"/>
                <label className="menu__toggle navbar__toggle" htmlFor="menu__checkbox-1"></label>
                <ul className="menu__list">{items}</ul>
            </div>
        );
    }
}
Navbar.prototype._ITEMS = [
    {name: 'home', url: '/'},
    {name: 'about', url: '/about'},
    {name: 'support', url: '/support'}
];


module.exports = Navbar;
