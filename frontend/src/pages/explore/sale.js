import React, { useEffect } from 'react'
import Navbar from '../../components/navbar'
import AuctionsTwo from '../../components/auctions-two'
import Footer from '../../components/footer';
import Switcher from '../../components/switcher';
import { Link } from 'react-router-dom';
import DiscoverItems from '../../components/discover-items';

export default function Sale() {
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);
    return (
        <>
            <Navbar />
            <section className="relative table w-full py-36 bg-[url('../../assets/images/bg/bg1.jpg')] bg-bottom bg-no-repeat">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900"></div>
                <div className="container">
                    <div className="grid grid-cols-1 pb-8 text-center mt-10">
                        <h3 className="md:text-3xl text-2xl md:leading-snug tracking-wide leading-snug font-medium text-white">Items On Sale</h3>

                    </div>
                </div>
            </section>
            <section className="relative py-16">
                <DiscoverItems allData={true} pagination={true} showAuction={false} showSale={true} title={'Items On Sale'}/>
                {/* <AuctionsTwo pagination={true} allData={true}/> */}
            </section>
            <Footer />
            <Switcher />
        </>
    )
}
