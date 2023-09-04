import { Button, Modal, Table } from "antd";
import { Check, XIcon, Zap } from "lucide-react";
interface Props {
  open: boolean;
  onClose: () => void;
  message?: string;
}
const UpgradePromptModal = ({ open, onClose, message }: Props) => {
  const valueRenderer = (
    value: string | number | boolean,
    row: { feature: string; free: any; pro: any }
  ) => {
    if (value === true) {
      return (
        <>
          <Check className="text-green-800" strokeWidth={3} size={20} />
          <span className="sr-only">Supported</span>
        </>
      );
    } else if (value === false) {
      return (
        <>
          <XIcon className="text-amber-800" strokeWidth={3} size={20} />
          <span className="sr-only">Not supported</span>
        </>
      );
    } else if (value === "sub") {
      return (
        <Button block type="primary">
          Subscribe
        </Button>
      );
    } else if (String(row.feature).toLocaleLowerCase() === "price") {
      return (
        <span className="">
          <span className="text-xl font-bold">{value}</span>
          <span className="text-xs"> USD</span>
        </span>
      );
    }
    return <span className="whitespace-pre-line">{value}</span>;
  };

  return (
    <>
      <Modal
        title={
          <h3 className="font-bold flex flex-row gap-1 items-center">
            <Zap size={20} />
            <span>Upgrade Your Plan</span>
          </h3>
        }
        open={open}
        onCancel={onClose}
        closable={true}
        okButtonProps={{ className: "hidden" }}
        cancelButtonProps={{ className: "hidden" }}
      >
        {message && <p>{message}</p>}
        <Table
          columns={[
            { title: "", dataIndex: "feature" },
            {
              className: "w-32 !text-center",

              title: "Free",
              dataIndex: "free",

              render: valueRenderer,
            },
            {
              className: "w-32 !text-center",
              title: "Pro",
              dataIndex: "pro",
              render: valueRenderer,
            },
          ]}
          size="small"
          pagination={false}
          onHeaderRow={(row: any) => ({
            ...row,
            className: (row.className || "") + " text-xl",
          })}
          dataSource={[
            { feature: "Price", free: 0, pro: 25 },
            { feature: "Flows", free: 5, pro: "100" },
            {
              feature: "Prompt runs",
              free: "100",
              pro: "5,000/month\nUS$5 per additional +1k",
            },
            { feature: "Versioning", free: false, pro: true },
            { feature: "Sharing", free: false, pro: true },
            { feature: "Flow Testing", free: false, pro: true },
            { feature: "", free: "", pro: "sub" },
          ]}
        />
        {/* <div className="h-[30vh] flex flex-col gap-4 items-center justify-center">
          <div className="flex flex-col justify-center items-center">
            <img src="/branding/icon-only.png" className="p-2 h-20" />
            <p>Sign into PromptPro</p>
            <p className="mb-0">
              All new users will have <strong>5 prompt flows</strong> and{" "}
              <strong>100 runs</strong> for <strong>free</strong>
            </p>
          </div>
          <Divider className="my-0" />
          <Button
            className="flex flex-row gap-2 items-center justify-center"
            block
            size="large"
            icon={<GoogleIcon width={16} />}
            onClick={()=>{
                signInWithGoogle()
            }}
          >
            Sign in with Google
          </Button>
        </div> */}
      </Modal>
    </>
  );
};

export default UpgradePromptModal;
