'use client'

import BannerWrapper from '@/components/banner/BannerWrapper'
import SearchResults from '../_components/search-results'

const PatentsIdPage = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <BannerWrapper />
      <SearchResults pk={false} />
    </div>
  )
}

export default PatentsIdPage
