import React from 'react'
import Navbar from '../components/navbar'
import Footer from '../components/footer'
import Switcher from '../components/switcher'
import { Link } from 'react-router-dom'
import {MdOutlineArrowForward} from "../assets/icons/vander"

export default function PrivacyPolicy() {
    return (
        <>
            <Navbar />
            <section className="relative table w-full py-36 bg-[url('../../assets/images/bg/bg1.jpg')] bg-bottom bg-no-repeat">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
                <div className="container">
                    <div className="grid grid-cols-1 pb-8 text-center mt-10">
                        <h3 className="md:text-3xl text-2xl md:leading-snug tracking-wide leading-snug font-medium text-white">Privacy Policy</h3>

                    </div>
                </div>

                <div className="absolute text-center z-10 bottom-5 start-0 end-0 mx-3">
                    <ul className="breadcrumb tracking-[0.5px] breadcrumb-light mb-0 inline-block">
                        <li className="inline breadcrumb-item text-[15px] font-semibold duration-500 ease-in-out text-white/50 hover:text-white"><Link to="/"> MetaQueer MArketplace </Link></li>
                        <li className="inline breadcrumb-item text-[15px] font-semibold duration-500 ease-in-out text-white" aria-current="page">Privacy Policy</li>
                    </ul>
                </div>
            </section>
            <div className="relative">
                <div className="shape absolute start-0 end-0 sm:-bottom-px -bottom-[2px] overflow-hidden z-1 text-white dark:text-slate-900">
                    <svg className="w-full h-auto" viewBox="0 0 2880 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z" fill="currentColor"></path>
                    </svg>
                </div>
            </div>

            <section className="relative md:py-24 py-16">
                <div className="container">
                    <div className="md:flex justify-center">
                        <div className="md:w-3/4">
                            <div className="p-6 bg-white dark:bg-slate-900 shadow dark:shadow-gray-800 rounded-md">
                                <h5 className="text-xl font-semibold mb-4">Overview:</h5>
                                <p className="text-slate-400"> At our NFT marketplace, we are committed to protecting the privacy and security of our users' personal information. </p>
                                <p className="text-slate-400"> This privacy policy explains how we collect, use, and disclose information on our platform.</p>

                                <h5 className="text-xl font-semibold mb-4 mt-8"> Information Collection:</h5>
                                <p className="text-slate-400"> We collect information that you provide to us when you create an account, upload an NFT, make a purchase, or contact us.</p>
                                <p className="text-slate-400"> This information may include your name, email address, payment information, and other personal details.</p>
                                
                                <h5 className="text-xl font-semibold mb-4 mt-8"> Use of Information:</h5>
                                <p className="text-slate-400"> We use your personal information to provide and improve our services, process transactions, communicate with you, and comply with legal obligations. </p>
                                <p className="text-slate-400"> We may also use non-personal information, such as website usage data, for analytics purposes.</p>

                                <ul className="list-none text-slate-400 mt-4"> . Information We Collect:

                                    <li className="flex items-center mt-2"><MdOutlineArrowForward className="text-violet-600 text-base align-middle me-2"/>Digital Marketing Solutions for Tomorrow</li>
                                    <li className="flex items-center mt-2"><MdOutlineArrowForward className="text-violet-600 text-base align-middle me-2"/>Our Talented & Experienced Marketing Agency</li>
                                    <li className="flex items-center mt-2"><MdOutlineArrowForward className="text-violet-600 text-base align-middle me-2"/>Create your own skin to match your brand</li>
                                    <li className="flex items-center mt-2"><MdOutlineArrowForward className="text-violet-600 text-base align-middle me-2"/>Digital Marketing Solutions for Tomorrow</li>
                                    <li className="flex items-center mt-2"><MdOutlineArrowForward className="text-violet-600 text-base align-middle me-2"/>Our Talented & Experienced Marketing Agency</li>
                                    <li className="flex items-center mt-2"><MdOutlineArrowForward className="text-violet-600 text-base align-middle me-2"/>Create your own skin to match your brand</li>
                                </ul>

                                <h5 className="text-xl font-semibold mb-4 mt-8">Information Provided Voluntarily :</h5>
                                <p className="text-slate-400">In the 1960s, the text suddenly became known beyond the professional circle of typesetters and layout designers when it was used for Letraset sheets (adhesive letters on transparent film, popular until the 1980s) Versions of the text were subsequently included in DTP programmes such as PageMaker etc.</p>

                                <div className="mt-8">
                                    <Link to="/" className="btn bg-violet-600 hover:bg-violet-700 border-violet-600 hover:border-violet-700 text-white rounded-full">Print</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <Switcher />
        </>
    )
}
