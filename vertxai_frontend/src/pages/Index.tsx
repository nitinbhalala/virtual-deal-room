import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/navbar";
import { CheckCircle, Shield, MessageSquare, FileText } from "lucide-react";

const Index = () => {
  const userDetails = JSON.parse(localStorage?.getItem("user"));

  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary/80 text-white py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tighter">
                  Secure Business Transactions in One Place
                </h1>
                <p className="text-lg md:text-xl text-white/90 max-w-[600px]">
                  Negotiate deals, exchange documents, and finalize transactions
                  securely in our virtual deal room.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  {isAuthenticated ? (
                    <Link to="/dashboard">
                      <Button
                        size="lg"
                        variant="default"
                        className="bg-white text-primary hover:bg-white/90"
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link to="/register">
                        <Button
                          size="lg"
                          variant="default"
                          className="bg-white text-primary hover:bg-white/90"
                        >
                          Get Started
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white text-white hover:bg-white/10"
                        >
                          Log In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute -left-4 -top-4 w-72 h-72 bg-white/10 rounded-lg transform rotate-6"></div>
                  <div className="absolute -right-4 -bottom-4 w-72 h-72 bg-white/10 rounded-lg transform -rotate-6"></div>
                  <div className="relative z-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-6">
                    <div className="space-y-4 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Real-time Negotiation</h3>
                          <p className="text-sm text-white/80">
                            Instant messaging with typing indicators
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Secure Documents</h3>
                          <p className="text-sm text-white/80">
                            Upload and share with confidence
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Protection</h3>
                          <p className="text-sm text-white/80">
                            End-to-end security for all transactions
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our virtual deal room streamlines business transactions from
                negotiation to completion.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Negotiate</h3>
                <p className="text-gray-600">
                  Create deals and negotiate prices in real-time with secure
                  messaging.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Document</h3>
                <p className="text-gray-600">
                  Share and review important documents with access control.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Finalize</h3>
                <p className="text-gray-600">
                  Close deals securely and maintain a record of all
                  transactions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="bg-primary rounded-2xl p-8 md:p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-xl mb-6 max-w-xl mx-auto">
                Join thousands of businesses making secure deals through our
                platform.
              </p>

              {isAuthenticated ? (
                userDetails?.role === "seller" ? (
                  <Link to="/deals/create">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      Create Your First Deal
                    </Button>
                  </Link>
                ) : (
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                )
              ) : (
                <Link to="/register">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Sign Up Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Virtual Deal Room</h3>
              <p className="text-gray-400">
                Secure business transactions platform for professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-gray-400 hover:text-white"
                  >
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">support@virtualdealroom.com</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500">
            <p>© 2023 Virtual Deal Room. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
