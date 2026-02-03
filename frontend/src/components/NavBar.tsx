const NavBar = () => {
  return (
    <nav className=" top-0 left-0 right-0 z-50  ">
      <div className="flex justify-center h-16">
        {/* Centered Logo with Blue Accent */}
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-blue-900 tracking-tight">
                Pimp Track
              </h1>
              <p className="text-xs text-blue-500 -mt-1">Skin Tracker</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
