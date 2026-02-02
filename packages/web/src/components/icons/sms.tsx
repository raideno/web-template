export type SmsIconProps = React.SVGProps<SVGSVGElement> & {}

export const SmsIcon: React.FC<SmsIconProps> = (props) => {
  return (
    <svg
      width="22"
      height="22"
      style={{
        display: 'inline-block',
        marginBottom: '3px',
      }}
      viewBox="0 0 554 554"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M411.845 36H142.155C83.5271 36 36 83.5272 36 142.155V411.845C36 470.473 83.5271 518 142.155 518H411.845C470.473 518 518 470.473 518 411.845V142.155C518 83.5272 470.473 36 411.845 36Z"
        fill="url(#paint0_linear_110_391)"
      />
      <path
        d="M277 119.439C230.08 119.439 185.081 134.964 151.904 162.599C118.726 190.234 100.087 227.714 100.087 266.795C100.13 292.216 108.067 317.195 123.127 339.304C138.187 361.414 159.858 379.903 186.034 392.974C179.062 408.581 168.606 423.217 155.099 436.275C181.293 431.677 205.881 422.017 226.951 408.048C243.197 412.069 260.052 414.124 277 414.152C323.92 414.152 368.918 398.626 402.096 370.992C435.273 343.357 453.912 305.877 453.913 266.795C453.912 227.714 435.273 190.234 402.096 162.599C368.918 134.964 323.92 119.439 277 119.439Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_110_391"
          x1="280.825"
          y1="486.005"
          x2="280.825"
          y2="95.8184"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0CBD2A" />
          <stop offset="1" stopColor="#5BF675" />
        </linearGradient>
      </defs>
    </svg>
  )
}
