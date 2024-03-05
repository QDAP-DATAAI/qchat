import { CosmosDBUserContainer, UserRecord } from "../user-management/user-cosmos";
import { CosmosDBTenantContainerExtended } from "../tenant-management/tenant-groups";
import { CosmosDBTenantContainer, TenantRecord } from "../tenant-management/tenant-cosmos";

const groupAdmins = process.env.ADMIN_EMAIL_ADDRESS.split(',').map(string => string.toLowerCase().trim());
export class UserSignInHandler {
  static async handleSignIn(user: UserRecord, groupsString?: string): Promise<boolean> {
    const userContainer = new CosmosDBUserContainer();
    const tenantContainerExtended = new CosmosDBTenantContainerExtended();
    const tenantContainer = new CosmosDBTenantContainer();

    try {
      // Groups claim (Profile)
      const userGroups = groupsString ? groupsString.split(',').map(group => group.trim()) : []

      // Creates or updates the user
      const existingUser = await userContainer.getUserByUPN(user.tenantId, user.upn ?? '');
      if (!existingUser) {
        await userContainer.createUser({
          ...user,
          first_login: new Date(),
          accepted_terms: false,
          accepted_terms_date: "",
          groups: userGroups,
        });
      } else {
        const currentTime = new Date();
        await userContainer.updateUser({
          ...existingUser,
          last_login: currentTime,
          groups: userGroups,
        }, user.tenantId, user.userId);
      }

      // Validate if the tenant exists
      const tenant = await tenantContainerExtended.getTenantById(user.tenantId);
      if (!tenant) {
        //Create tenant with group login required
        const TenantRecord: TenantRecord = {
          tenantId: user.tenantId,
          primaryDomain: user.upn?.split('@')[1],
          requiresGroupLogin: true,
          id: user.tenantId,
          email: user.upn,
          supportEmail: "support@" + user.upn?.split('@')[1],
          dateCreated: new Date(),
          dateUpdated: null,
          dateOnBoarded: null,
          dateOffBoarded: null,
          modifiedBy: null,
          createdBy: user.upn,
          departmentName: null,
          groups: [],
          administrators: groupAdmins, //currently on groupAdmins, to be managed by tenant admins ()
          features: null,
          serviceTier: null,
        };

        await tenantContainer.createTenant(TenantRecord);

        return false;
      }

      // Validate if the group is required and exists on tenant 
      if (tenant.requiresGroupLogin) {
        if (userGroups.length === 0 || !(await tenantContainerExtended.areGroupsPresentForTenant(user.tenantId, groupsString || ""))) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error handling sign-in:", error);
      return false;
    }
  }
};
