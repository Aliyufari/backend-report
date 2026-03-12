// import { type SharedData } from '@/types'
import { Head, Link, usePage } from '@inertiajs/react'
import bannerImage from '@/assets/images/banner.jpg'
import logo from '@/assets/images/logo.png'
import { login, register } from '@/routes'

export default function Welcome() {
    // const { auth } = usePage<SharedData>().props

    return (
        <>
            <Head title="Backend Report">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <section
                className="relative min-h-screen flex flex-col"
                style={{
                    backgroundImage: `url("${bannerImage}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

                {/* Header */}
                <header className="relative z-10 w-full">
                    <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Backend Report Logo" className="h-10 w-auto" />
                            <span className="text-white font-semibold text-lg tracking-wide">
                                Backend Report
                            </span>
                        </div>

                        <Link
                            href={login()}
                            className="bg-primary hover:bg-green-600 text-white font-medium px-5 py-2.5 rounded-lg transition duration-300 shadow-md"
                        >
                            Login
                        </Link>
                    </div>
                </header>

                {/* Hero Content */}
                <div className="relative z-10 flex flex-1 items-center justify-center px-6">
                    <div className="max-w-3xl text-center text-white space-y-8">
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Smart Election Data Monitoring System
                        </h1>

                        <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                            Backend Report is a comprehensive platform designed to
                            track Continuous Voter Registration (CVR) records of INEC Nigeria,
                            analyze polling unit and accreditation data, and manage verified
                            voting results across all states nationwide.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={register()}
                                className="bg-primary hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition duration-300 shadow-lg"
                            >
                                Get Started
                            </Link>

                            <a
                                href="#about"
                                className="border border-white/40 hover:bg-white/10 text-white px-8 py-4 rounded-xl transition duration-300"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}