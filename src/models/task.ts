export default interface Task {
  _id?: string;
  title: string;
  description?: string;
  status: "pending" | "in progress" | "completed";
  dueDate: Date;
  createdAt?: Date;
  modifiedAt?: Date;
}
