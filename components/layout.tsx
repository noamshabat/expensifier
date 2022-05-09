import Drawer from './filesDrawer'

const layout: React.FC = ({ children }) => {
  return (
    <>
      <Drawer>
        <main>{children}</main>
      </Drawer>
    </>
  )
}

export default layout