'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFoundClient() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '100px 50px', gridGap: '100px' }}>
        <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH_URL}/images/lucky_sorry.jpg`} width={280} height={280} alt='Sorry' />
        <div>
          <span style={{ marginBottom: '10px', display: 'block', color: '#FF0000', fontWeight: 'bolder', fontSize: '48px' }}>連線失敗!!</span>
          <span style={{ marginBottom: '10px', display: 'block', fontWeight: 'bolder', fontSize: '32px' }}>載入頁面時與伺服器連線失敗。</span>
          <ul style={{ marginBottom: '10px', textAlign: 'left', fontSize: '18px', lineHeight: '40px' }}>
            <li>該網站伺服器過於忙碌，請過幾分鐘後再次嘗試。</li>
            <li>若無法載入網站，請先檢查您的網路狀態。</li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gridGap: '5px', fontSize: '18px' }}>
            <span>若您有任何問題，請洽</span>
            <span>數位平台發展部</span>
            <Link className='myfooter_link' href='mailto:DAD_Service@msi.com'>DAD_Service@msi.com</Link>
            。
          </div>
        </div>
      </div>
    </div>
  )
}
