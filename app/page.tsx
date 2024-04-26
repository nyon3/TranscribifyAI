import { LoginButton, HomePageLoginButton } from '../components/loginButton';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';
import Link from 'next/link';
export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header Section */}
      <header className="container mx-auto px-6 py-12 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">AudioSummAI</h1>
        <LoginButton />
      </header>

      {/* Main Content Section */}

      <main className="flex flex-col items-center justify-center flex-grow"> {/* Center content vertically */}
        {/* Beta Notice + Hero Section */}
        <div className="flex flex-col items-center justify-center flex-grow space-y-6"> {/* Centrally aligns Beta Notice and Hero Section */}
          <div className="bg-white text-gray-600 py-2 px-4 border border-gray-300 rounded-full text-center">
            <p className="text-sm font-semibold">
              Sign up now and enjoy free access to our service for a limited time.
            </p>
          </div>
          <h2 className="text-4xl font-bold text-gray-800">
            Transform Audio into Summaries Fast with AI
          </h2>
          <p className="text-gray-600">
            Simplify Your Workflows with AI Transcription and Smart Summarization.
          </p>
          <HomePageLoginButton />
          <Link href={'/dashboard'}>Create Summaries</Link>
        </div>
      </main>


      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-6 flex flex-wrap justify-between items-center">
          {/* Icons Container */}
          <div className="flex justify-center items-center space-x-4">
            <a href="https://github.com/nyon3/TranscribifyAI" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub size={24} />
            </a>
            <a href="https://discordapp.com/users/808692913289822218" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <FaDiscord size={24} />
            </a>
            <a href="https://twitter.com/Tomo_anz" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter size={24} />
            </a>
          </div>
          {/* Text Content */}
          <p className='text-sm text-gray-300'>© 2023 Tomoya Anzai.</p>
        </div>
      </footer>

    </div>
  );
}



{/* Benefits Section */ }
//    <section className="bg-white py-8">
//    <div className="container mx-auto px-6 space-y-6">
//      <h3 className="text-center text-2xl font-bold text-gray-800">
//        Why Choose Us?
//      </h3>
//      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
//        {/* Benefit 1 */}
//        <div className="flex-1 max-w-md bg-blue-100 p-4 rounded-lg">
//          <h4 className="font-bold text-lg">Accurate Summaries</h4>
//          <p className="text-sm text-gray-600">
//            Quickly summarize your meetings and discussions with high accuracy.
//          </p>
//        </div>
//        {/* Benefit 2 */}
//        <div className="flex-1 max-w-md bg-green-100 p-4 rounded-lg">
//          <h4 className="font-bold text-lg">Seamless Translation</h4>
//          <p className="text-sm text-gray-600">
//            Translate your transcriptions for a global audience in a single step.
//          </p>
//        </div>
//        {/* Benefit 3 */}
//        <div className="flex-1 max-w-md bg-purple-100 p-4 rounded-lg">
//          <h4 className="font-bold text-lg">Time Efficiency</h4>
//          <p className="text-sm text-gray-600">
//            Save hours of manual work with our automated transcription service.
//          </p>
//        </div>
//      </div>
//    </div>
//  </section>