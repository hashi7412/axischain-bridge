/* import React from 'react'; */
import {Link} from "react-router-dom";
import { useSelector} from 'react-redux';
import { useWallet } from 'use-wallet'

import useStore from '../useStore';

const Layout = (props:any) => {
    const wallet = useWallet()
    const {update} = useStore()

    return (
        <div style={{ background:'url("/bg-white.webp") 0% 0% / 100% 100% no-repeat', minHeight:'100vh' }}>
            <header>
                <section>
                    <div>
                        <Link className="title" to="/">
                            <img src="/logo.svg" style={{height:'auto'}} alt="logo" />
                            <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 12" height="16">
                                <path fill="currentColor" d="m14.8 9.5h-8.6l-1.4 2.3h-4.1l7.5-11.6h4.6l7.5 11.6h-4.1zm-1.6-2.4l-2.7-4.5-2.8 4.5zm12.6-7l4.8 4 4.9-4h5l-7.2 5.8 7.2 5.8h-5.2l-4.7-3.9-4.9 3.9h-5.1l7.2-5.7-7.2-5.9zm16.2 11.6v-11.6h3.4v11.6zm13.5 0.2c-2.9 0-6.2-0.4-8.3-0.9l0.5-2.7c2.4 0.5 5.3 0.9 8.7 0.9 2.8 0 3.2-0.2 3.2-0.9 0-0.7-0.4-0.8-1.3-0.9l-6.4-0.3c-3.6-0.2-4.9-1.4-4.9-3.5 0-2.6 2.3-3.7 7.7-3.7 2 0 5.4 0.4 7.6 0.9l-0.5 2.6c-2-0.4-5-0.8-7.9-0.8-3.2 0-3.6 0.2-3.6 0.9 0 0.6 0.4 0.8 1.5 0.8l6.3 0.4c3.3 0.2 4.8 1.3 4.8 3.7 0 2.5-1.7 3.5-7.4 3.5zm17.1-1.3c2.8 0 5.7-0.6 7.6-1l0.3 1.3c-2.2 0.5-5.2 1-7.9 1-5.6 0-8.1-1.9-8.1-6 0-4 2.5-5.9 8.1-5.9 2.7 0 5.7 0.4 7.9 1l-0.3 1.3c-1.9-0.4-4.8-1-7.6-1-4.9 0-6.5 1.5-6.5 4.6 0 3.1 1.6 4.7 6.5 4.7zm10.1 1.1v-11.6h1.5v4.9h12.4v-4.9h1.6v11.6h-1.6v-5.4h-12.4v5.4zm31.5-2.8h-10.8l-2 2.8h-1.9l8.3-11.6h2l8.3 11.6h-1.9zm-0.8-1.1l-4.6-6.6-4.7 6.6zm6 3.9v-11.6h1.6v11.6zm4.1 0v-11.6h1.8l12.6 10v-10h1.5v11.6h-1.7l-12.7-10v10z"/>
                            </svg>
                        </Link>
                        <ul className="menu">
                            <li><Link to="/">Bridge</Link></li>
                            <li><Link to="/">Ecosystem</Link></li>
                            <li><Link to="/">Developers</Link></li>
                            <li><Link to="/">Community</Link></li>
                            <li><Link to="/">Help</Link></li>
                            <li><Link to="/">About</Link></li>
                        </ul>
                    </div>
                    <div className="action">
                        <button style={{padding:'10px 20px', border:'none', backgroundColor:'transparent', cursor:'pointer'}} onClick={()=>wallet.status==='disconnected' && update({page:1})}>{(wallet.status==='connected' && wallet.account) ? `${wallet.account.slice(0,8) + '...' + wallet.account.slice(-4)}` : 'Connect Wallet'}</button>
                        <Link to="/" style={{ padding:'10px 20px', border:'1px solid var(--bg-hover)' }}>Start Building</Link>
                    </div>
                    <label className="menu">
                        <input type="checkbox" />
                        <span className="menu"><span className="hamburger"></span></span>
                        <ul>
                            <li><Link to="/">Bridge</Link></li>
                            <li><Link to="/">Ecosystem</Link></li>
                            <li><Link to="/">Developers</Link></li>
                            <li><Link to="/">Community</Link></li>
                            <li><Link to="/">Help</Link></li>
                            <li><Link to="/">About</Link></li>
                        </ul>
                    </label>
                </section>
            </header>
            <main>
                {props.children}
            </main>
            
            <footer>
            </footer>
        </div>
    );
}

export default Layout;