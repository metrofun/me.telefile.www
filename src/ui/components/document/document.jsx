var React = require('react'),
    Page = require('../page/page.jsx');

class DocumentComponent extends React.Component {
    render() {
        return (<html>
            <head>
                <meta charSet="UTF-8" />
                <link href="/index.css" rel="stylesheet" type="text/css" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                <meta name="description" content="TeleFile.Me is a free service for peer-to-peer file share" />
                <meta name="keywords" content="file share, send file, from desktop to mobile, webrtc" />
                <meta name="author" content="Dmytrii Shchadei" />

                <meta property="og:site_name" content="TeleFile.Me" />
                <meta property="og:title" content="TeleFile.Me – send a file in two clicks" />
                <meta property="og:description" content="Seamlessly share files between all your friends and devices" />
                <meta property="og:type" content="website" />

                <meta name="twitter:card" content="product" />
                <meta name="twitter:site" content="@TeleFileMe" />
                <meta name="twitter:creator" content="@metrofun" />
                <meta name="twitter:domain" content="telefile.me" />
                <meta name="twitter:title" content="TeleFile.Me – peer-to-peer file sharing tool" />

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
                <title>TeleFile.Me</title>
            </head>
            <body>
                <Page />
            </body>
            <script async src="/index.js"></script>
        </html>);
    }
}

module.exports = DocumentComponent;
