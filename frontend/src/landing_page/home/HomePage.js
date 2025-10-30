import React from 'react'
import Hero from './Hero'
import Pricing from './Pricing'
import Education from './Education'

import OpenAccount from '../OpenAccount'
import TrustSection from './TrustSection'
import Awards from './Awards'


const HomePage = () => {
  return (
    <>
      <Hero/>
      <Awards/>
      <TrustSection/>
      <Pricing/>
      <Education/>
      <OpenAccount/>
    </>
  )
}

export default HomePage
