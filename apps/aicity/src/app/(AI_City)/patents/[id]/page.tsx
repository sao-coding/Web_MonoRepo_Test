'use client'

import Banner from '@/components/banner-b'
import SearchResults from '../_components/search-results'

const PatentsIdPage = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <Banner><>&nbsp;</></Banner>
      <SearchResults pk={false} />
    </div>
  )
}

export default PatentsIdPage
