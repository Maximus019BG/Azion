import React from "react";

const Footer = () => {
    return (
        <footer className="footer footer-center bg-base-300 text-base-content rounded p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Contact Information */}
                <div>
                    <h3 className="font-bold text-lg">Contact Us</h3>
                    <p className="mt-2">
                        Phone: <a href="tel:+359 88 503 1865" className="link link-hover">+359 88 503 1865</a>
                    </p>
                    <p>
                        Email: <a href="mailto:aziononlineteam@gmail.com"
                                  className="link link-hover">aziononlineteam@gmail.com</a>
                    </p>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col items-center">
                    <h3 className="font-bold text-lg">Quick Links</h3>
                    <a href="/download" className="link link-hover mt-2">Download our Desktop App</a>
                </nav>

                {/* Social Media Links */}
                <div className="flex flex-col items-center">
                    <h3 className="font-bold text-lg">Follow Us</h3>
                    <div className="grid grid-flow-col gap-4 mt-4">
                        <a href="https://www.instagram.com/aziononlineteam" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                className="fill-current"
                            >
                                <path
                                    d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.314 3.608 1.29.975.976 1.228 2.242 1.29 3.608.059 1.266.07 1.646.07 4.849s-.012 3.583-.07 4.85c-.062 1.366-.314 2.632-1.29 3.608-.975.975-2.242 1.227-3.608 1.29-1.266.059-1.646.07-4.85.07s-3.583-.012-4.849-.07c-1.366-.062-2.633-.314-3.608-1.29-.976-.975-1.228-2.242-1.29-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.583.07-4.849c.062-1.366.314-2.633 1.29-3.608C4.499 2.477 5.765 2.225 7.13 2.163 8.397 2.104 8.777 2.163 12 2.163zm0-2.163C8.74 0 8.332.014 7.052.074c-1.682.073-3.161.392-4.318 1.548C1.574 2.667 1.254 4.146 1.18 5.828.941 8.054.941 8.744.941 12c0 3.256.014 3.946.074 5.226.073 1.682.392 3.161 1.548 4.318 1.157 1.157 2.636 1.475 4.318 1.548C8.332 23.986 8.74 24 12 24c3.26 0 3.668-.014 4.948-.074 1.682-.073 3.161-.392 4.318-1.548 1.157-1.157 1.475-2.636 1.548-4.318.06-1.28.074-1.97.074-5.226 0-3.256-.014-3.946-.074-5.226-.073-1.682-.392-3.161-1.548-4.318C20.116.466 18.637.147 16.955.074 15.676.014 15.26 0 12 0z"></path>
                                <circle cx="12" cy="12" r="3.063"></circle>
                                <path d="M18.406 5.594a1.44 1.44 0 1 1 0 2.88 1.44 1.44 0 0 1 0-2.88z"></path>
                            </svg>
                        </a>
                        <a href="https://x.com/AzionOnline" target="_blank" rel="noopener noreferrer">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                className="fill-current"
                            >
                                <path
                                    d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.577 2.162-2.724-.951.565-2.005.974-3.127 1.195-.897-.957-2.176-1.555-3.593-1.555-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.125-4.09-.205-7.719-2.166-10.149-5.144-.425.724-.666 1.561-.666 2.457 0 1.69.861 3.179 2.169 4.054-.801-.026-1.556-.247-2.214-.616v.061c0 2.361 1.675 4.335 3.903 4.778-.407.111-.836.171-1.279.171-.312 0-.615-.03-.911-.086.631 1.953 2.445 3.377 4.6 3.417-1.686 1.32-3.81 2.105-6.115 2.105-.398 0-.79-.023-1.176-.068 2.179 1.397 4.768 2.211 7.548 2.211 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.548z"></path>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <aside className="mt-10">
                <p>
                    Copyright © {new Date().getFullYear()} - All rights reserved by AzionOnline Team
                </p>
            </aside>
        </footer>
    );
};

export default Footer;
