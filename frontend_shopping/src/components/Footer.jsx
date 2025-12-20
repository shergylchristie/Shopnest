const Footer = () => {
  return (
    <footer className="bg-teal-700 text-gray-300 py-4">
      <div className="container mx-auto px-4 text-center space-y-3">
        {/* Logo */}
        <div className="flex justify-center">
          <img src="\logo.png" alt="Company Logo" className=" w-28" />
        </div>

        {/* Contact - very compact */}
        <div className="text-xs leading-tight">
          <p>123 Commerce St., Mumbai 400001</p>
          <p>+91 98765 43210 • support@company.com</p>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center text-[10px] text-gray-400 mt-2">
        &copy; {new Date().getFullYear()} Shergyl Christie
      </div>
    </footer>
  );
};

export default Footer;
