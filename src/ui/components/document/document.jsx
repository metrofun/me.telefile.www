var React = require('react'),
    Page = require('../page/page.jsx');

class DocumentComponent extends React.Component {
    _getContent() {
        // hack to set checksum to the content,
        // so that content can be reused in client side
        return {
            __html: React.renderToString(<Page/>)
        };
    }
    _getAnalytics() {
        // hack to set checksum to the content,
        // so that content can be reused in client side
        return {
            __html: "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) })(window,document,'script','//www.google-analytics.com/analytics.js','ga'); ga('create', 'UA-9568575-7', 'auto'); ga('send', 'pageview');"
        };
    }
    render() {
        return (<html>
            <head>
                <meta charSet="UTF-8" />
                <link href="/index.css" rel="stylesheet" type="text/css" />
                <meta name="viewport" content="width=device-width,initial-scale=1, user-scalable=no, maximum-scale=1.0" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                <meta name="description" content="TeleFile is the peer-to-peer (P2P) file sharing tool that has no limits. Send large videos, send photos and send large files of any type. Sharing files with your friends or between devices was never this easy." />
                <meta name="keywords" content="file share, send file, from desktop to mobile, webrtc" />
                <meta name="author" content="Dmytrii Shchadei" />

                <meta property="og:site_name" content="TeleFile.Me" />
                <meta property="og:title" content="TeleFile.Me – send files peer-to-peer in two clicks" />
                <meta property="og:description" content="TeleFile is the peer-to-peer (P2P) file sharing tool that has no limits. Send large videos, send photos and send large files of any type. Sharing files with your friends or between devices was never this easy." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="http://telefile.me/" />
                <meta property="og:image" content="http://telefile.me/assets/twitter-card-image.png" />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:width" content="940" />
                <meta property="og:image:height" content="492" />

                <meta name="twitter:card" content="product" />
                <meta name="twitter:site" content="@TeleFileMe" />
                <meta name="twitter:creator" content="@metrofun" />
                <meta name="twitter:domain" content="telefile.me" />
                <meta name="twitter:description" content="TeleFile is the peer-to-peer (P2P) file sharing tool that has no limits. Send large videos, send photos and send large files of any type. Sharing files with your friends or between devices was never this easy."/>
                <meta name="twitter:image" content="http://telefile.me/assets/twitter-card-image.png" />
                <meta name="twitter:image:width" content="940" />
                <meta name="twitter:image:height" content="492" />

                <link rel="apple-touch-icon-precomposed" sizes="57x57" href="/apple-touch-icon-57x57.png" />
                <link rel="apple-touch-icon-precomposed" sizes="114x114" href="/apple-touch-icon-114x114.png" />
                <link rel="apple-touch-icon-precomposed" sizes="72x72" href="/apple-touch-icon-72x72.png" />
                <link rel="apple-touch-icon-precomposed" sizes="144x144" href="/apple-touch-icon-144x144.png" />
                <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/apple-touch-icon-120x120.png" />
                <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/apple-touch-icon-152x152.png" />
                <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
                <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />

                <meta name="application-name" content="TeleFile"/>
                <meta name="msapplication-TileColor" content="#0288D1" />
                <meta name="msapplication-TileImage" content="/mstile-144x144.png" />

                <link rel="manifest" href="/manifest.json" />

                <title>TeleFile.Me</title>
            </head>
            <body dangerouslySetInnerHTML={this._getContent()}></body>
            <script async src="/index.js"></script>
            <script dangerouslySetInnerHTML={this._getAnalytics()}>
                </script>
        </html>);
    }
}

module.exports = DocumentComponent;
