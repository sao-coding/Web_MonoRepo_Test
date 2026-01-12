'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { getPaginationRange, shouldShowEllipsis } from '@/utils/pagination'

interface PatentsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

const PatentsPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PatentsPaginationProps) => {
  if (totalPages <= 1)
    return null

  const pageRange = getPaginationRange(totalPages, currentPage, maxVisiblePages)
  const { showStartEllipsis, showEndEllipsis } = shouldShowEllipsis(totalPages, currentPage, maxVisiblePages)

  const handlePrevious = () => {
    const prev = Math.max(1, currentPage - 1)
    onPageChange(prev)
  }

  const handleNext = () => {
    const next = Math.min(totalPages, currentPage + 1)
    onPageChange(next)
  }

  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePrevious}
            className={isFirstPage ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {showStartEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => onPageChange(1)}
                isActive={false}
              >
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </>
        )}

        {pageRange.map(pageNum => (
          <PaginationItem key={pageNum}>
            <PaginationLink
              href="#"
              isActive={pageNum === currentPage}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showEndEllipsis && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={() => onPageChange(totalPages)}
                isActive={false}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handleNext}
            className={isLastPage ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PatentsPagination
